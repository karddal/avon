from app.core.helpers.gitlab import gl_create_coursework, gl_template_files, gl_activate_template_project, gl_template_urls, gl_upload_zip, gl_overwrite_zip
# Adding this back in
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlmodel import Session, select
from sqlalchemy import exists, and_

# GitLab helpers
from app.core.helpers.gitlab import gl_delete_coursework,gl_update_coursework

from app.core.security import get_current_user_with_role
from app.db.session import get_session
from typing import Annotated, Optional
from uuid import UUID
from app.core.settings import settings

from app.models.coursework import Coursework
from app.models.unit import Unit, UnitWithCourseworks
from app.schemas.coursework import CourseworkCreate, CourseworkRead, CourseworkSetupProgress, CourseworkTemplateUploadZip, CourseworkUpdate, CourseworkDelete, CourseworkTemplateExists, CourseworkTemplateActivate, CourseworkTemplateFile, CourseworkTemplateUrl, CourseworkUpdateFormData
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.coursework import CourseworkEventRead
from app.schemas.security import CurrentUser
import datetime

router = APIRouter(prefix = "/coursework", tags=["coursework"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = CourseworkRead, status_code=status.HTTP_201_CREATED)
async def create_coursework(coursework: CourseworkCreate, session: session_dependency):
    courseworkAlreadyExists = session.exec(select(Coursework).where((Coursework.unit_id == coursework.unit_id) & (Coursework.name == coursework.name) & (Coursework.due_date == coursework.due_date))).first()
   
    if courseworkAlreadyExists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coursework already made that belongs to the same unit and has the same name")
    
    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail='Corresponding unit not found')

    try:
        if settings.testing_mode:
            gl_data = {"gitlabGroupId": 12345678}
        else:
            gl_data = await gl_create_coursework(coursework.name, unit_exists.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Database failed. GitLab group rolled back."
    )

    db_coursework = Coursework(name=coursework.name,description=coursework.description,unit_id=coursework.unit_id, due_date=coursework.due_date, colour=coursework.colour, gitlab_id=gl_data["gitlabGroupId"])

    session.add(db_coursework)
    session.commit()
    session.refresh(db_coursework)
    return db_coursework

@router.get("/all")
async def all_courseworks(session: session_dependency):
    statement = (select(Unit).options(selectinload(Unit.courseworks), selectinload(Unit.programme),))

    units = session.exec(statement).all()

    results = [
        UnitWithCourseworks(
            id=unit.id,
            unit_code=unit.unit_code,
            name=unit.name,
            programme_start_date=unit.programme.start_date,
            programme_end_date=unit.programme.end_date,
            courseworks=unit.courseworks,
        ).model_dump()
        for unit in units
    ]

    return results

@router.get('/progress', response_model=list[CourseworkSetupProgress])
async def setup_progress(courseworkId: UUID, session: session_dependency):
    coursework = session.get(Coursework,courseworkId)
    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    
    if coursework.template_id:
        exists = True
    else:
        exists = False
    # When get other pices of info / steps are coed will put in here

    result = [{"title": "Create Template", "completed" : exists},
              {"title": "Create Dockerfile", "completed" : False},
              {"title": "Create Engine", "completed" : False},
              {"title": "Test Engine", "completed" : False},
              {"title": "Provision Repositories", "completed" : False},
              ]
    return result
@router.get("/events", response_model=list[CourseworkEventRead])
async def list_coursework_events(
        session: session_dependency,
        from_: Optional[datetime.datetime] = None,
        to: Optional[datetime.datetime] = None,
        unit_ids: Optional[list[UUID]] = None,
        current_user: CurrentUser = Depends(get_current_user_with_role)
        ):
    statement = (select(Coursework, Unit)
                 .join(Unit, Unit.id == Coursework.unit_id))

    if current_user.role != "admin":
        statement = statement.where(
            exists().where(
                and_(
                    UnitEnrollment.unit_id == Coursework.unit_id,
                    UnitEnrollment.user_id == current_user.user_id,
                )
            )
        )

    # TODO: currently useless code, I thought that we might need a function that can hide some coursework to student
    # enrollment_type = Optional[Literal["student", "lecturer"]] = None
    # if enrollment_type:
    #     statement = statement.where(UnitEnrollment.type == enrollment_type)

    if unit_ids:
        statement = statement.where(Coursework.unit_id.in_(unit_ids))
    if from_:
        statement = statement.where(Coursework.due_date >= from_)
    if to:
        statement = statement.where(Coursework.due_date < to)

    rows = session.exec(statement).all()

    return [
        {
            "id": coursework.id,
            "name": coursework.name,
            "due_date": coursework.due_date,
            "unit_id": str(unit.id),
            "unit_name": unit.name,
            "colour": coursework.colour,
        }
        for coursework, unit in rows
    ]

@router.get('/{id}/update_form_data', response_model=CourseworkUpdateFormData)
async def get_coursework_update_form_data(id: UUID, session: session_dependency):
    coursework = session.get(Coursework, id)
    unit = coursework.unit

    return CourseworkUpdateFormData(
        id=coursework.id,
        name=coursework.name,
        description=coursework.description,
        unit_id=unit.id,
        due_date=coursework.due_date,
        creation_date=coursework.creation_date,
        colour=coursework.colour,
        unit_name=unit.name,
        unit_code=unit.unit_code,
        gitlabId=coursework.gitlab_id,
        max_end_date=unit.programme.end_date,
    )


@router.get('/{id}', response_model = CourseworkRead)
async def get_coursework(id: UUID, session: session_dependency):
    coursework = session.get(Coursework,id)

    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    return coursework

@router.delete('/{id}', response_model=CourseworkDelete)
async def delete_coursework(id: UUID, session: session_dependency):
    coursework = session.get(Coursework,id)

    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    #print("\n\n\n\n\n\n\n")
    session.delete(coursework)
    session.commit()

    try:
        if not settings.testing_mode:
            await gl_delete_coursework(coursework.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail="Database failed. GitLab group rolled back."
    )

    #print("got here")
    courseworkDeleted = CourseworkDelete(id=id, deletion_successful=True)
    #print(courseworkDeleted)
    return courseworkDeleted

@router.put('/{id}', response_model=CourseworkRead)
async def update_coursework(id: UUID, coursework: CourseworkUpdate, session: session_dependency):
    coursework_db = session.get(Coursework, id)

    if coursework_db is None:
        raise HTTPException(status_code=404, detail='Coursework not found')

    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail='Corresponding unit not found')

    coursework_data = coursework.model_dump(exclude_unset=True)
    coursework_db.sqlmodel_update(coursework_data)
    
    try:
        if not settings.testing_mode:
            await gl_update_coursework(coursework_db.gitlab_id, coursework_db.name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail="Database failed. GitLab group rolled back."
        )

    session.add(coursework_db)
    session.commit()
    session.refresh(coursework_db)
    return coursework_db

@router.get('/{courseworkId}/template/exists', response_model=CourseworkTemplateExists)
async def template_exists(courseworkId: UUID, session: session_dependency):
    coursework = session.get(Coursework,courseworkId)
    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    if coursework.template_id:
        exists = True
        templateId = coursework.template_id
    else:
        exists = False
        templateId = None
        
    return {"exists":exists, "templateProjectId" : templateId}

@router.post('/{cw_id}/template/activate', response_model=CourseworkTemplateActivate)
async def activate_template(cw_id: UUID, gitLabId: str, session: session_dependency):
    try:
        templateActivation = await gl_activate_template_project(gitLabId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="GitLab request failed"
    )

    coursework = session.get(Coursework,cw_id)
    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    
    coursework.template_id = templateActivation["templateGitLabId"]
    session.add(coursework)
    session.commit()
    session.refresh(coursework)

    return templateActivation

@router.get('/template/files', response_model=list[CourseworkTemplateFile])
async def get_files(templateId: str, session: session_dependency):
    try:
        fileData = await gl_template_files(templateId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="GitLab request failed"
        )
    return fileData

@router.get('/template/urls', response_model=CourseworkTemplateUrl)
async def template_urls(templateId: str, session: session_dependency):
    try:
        urlData = await gl_template_urls(templateId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="GitLab request failed"
        )
    return urlData

@router.post('/{cw_id}/template/upload-zip', response_model=CourseworkTemplateUploadZip)
async def upload_zip(cw_id: UUID,  session: session_dependency, file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be in ZIP format")
    coursework = session.get(Coursework,cw_id)
    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    courseworkGitLabId = coursework.gitlab_id
    try:
        response = await gl_upload_zip(courseworkGitLabId, file)

    except HTTPException as e:
        print("GitLab error:", e.detail)
        raise  # Just gitalbs error message
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

    
    coursework = session.get(Coursework,cw_id)
    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    
    coursework.template_id = response["templateId"]
    session.add(coursework)
    session.commit()
    session.refresh(coursework)

    return response

@router.post('/template/overwrite-zip')
async def overwrite_zip(templateId: str, file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be in ZIP format")
    try:
        response = await gl_overwrite_zip(templateId, file)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return response