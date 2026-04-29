import asyncio
from datetime import datetime, timedelta
import random
from sqlmodel import Session, select

from app.db.session import engine

from sqlmodel import Session, select
from app.models.projects import ProvisionProject
from app.models.student_repo import StudentRepo
from app.core.helpers.gitlab import gl_create_fork


async def run_provision_worker():
    try: 
        while True:
            # print("inside me")
            job = fetch_next_job()

            if not job:
                await asyncio.sleep(1)
                continue

            await process_job(job)
    except asyncio.CancelledError:
        print("worker shutting down cleanly")
        return


def fetch_next_job():
    with Session(engine) as session:
        job = session.exec(
            select(ProvisionProject)
            .where(
                ProvisionProject.status == "pending",
                ProvisionProject.next_run_at <= datetime.now(),
                ProvisionProject.attempts <= ProvisionProject.max_attempts
            )
            .limit(1)
        ).first()
        # print(job)
        if not job:
            # print("no job found")
            return None

        job.status = "in_progress"
        session.commit()
        return job.id


async def process_job(job_id: int):
    with Session(engine) as session:
        job = session.get(ProvisionProject, job_id)
        # if switch == 5:
        try:
            data = await gl_create_fork(
                name=job.cw_name,
                user_id=job.student_id,
                group_id=job.gitlab_id,
                template_id=job.template_id
            )
            
            repo_url = data["http_url_to_repo"]
            # print("the repo url is",repo_url)
            existing = session.exec(
                select(StudentRepo).where(
                    StudentRepo.student_id == job.student_id,
                    StudentRepo.cw_id == job.cw_id
                )
            ).first()

            if existing:
                session.delete(existing)
                session.flush()

            session.add(StudentRepo(
                student_id=job.student_id,
                repo_url=repo_url,
                cw_id=job.cw_id,
                gl_repo_id=data["id"]
            ))

            job.status = "success"

        except Exception as e:
            if job.attempts < job.max_attempts:
                job.attempts += 1
                job.status = "pending"
                job.next_run_at = datetime.now() + timedelta(seconds=2 ** job.attempts)
                job.last_error = str(e)
            else:
                job.status = "failed"
                job.last_error = str(e)

        session.commit()
        # else:
        #     print("inside here")
        #     if job.attempts < job.max_attempts:
        #         job.attempts += 1
        #         job.status = "pending"
        #         job.next_run_at = datetime.now() + timedelta(seconds=2 ** job.attempts)
        #         print("done all of this")
        #     else:
        #         job.status = "failed"
        #     session.commit()
