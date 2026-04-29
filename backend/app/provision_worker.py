import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.db.session import engine

from app.models.projects import ProvisionProject, ProvisionBatch
from app.models.student_repo import StudentRepo
from app.core.helpers.gitlab import gl_create_fork


async def run_provision_worker():
    try: 
        while True:
            job = fetch_next_job()

            if not job:
                await asyncio.sleep(1)
                continue
            
            job_id, batch_id = job

            await process_job(job_id, batch_id)
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
        if not job:
            return None

        job.status = "in_progress"
        session.commit()
        return job.id, job.batch_id


async def process_job(job_id: int, batch_id: int):
    with Session(engine) as session:
        job = session.get(ProvisionProject, job_id)
        batch = session.get(ProvisionBatch, batch_id)
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
            batch.completed += 1

        except Exception as e:
            if job.attempts < job.max_attempts:
                job.attempts += 1
                job.status = "pending"
                job.next_run_at = datetime.now() + timedelta(seconds=2 ** job.attempts)
                job.last_error = str(e)
            else:
                job.status = "failed"
                batch.failed += 1
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
        #         batch.failed += 1  
        #         job.status = "failed"
        #     session.commit()
