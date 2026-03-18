import os
import subprocess
import sys
from pathlib import Path

import boto3
import botocore

REPO = os.environ["STUDENT_REPO"]
COMMAND = os.environ["RUN_COMMAND"]
BUILD_ID = os.environ["BUILD_ID"]
RESULT_QUEUE_URL = os.environ["RESULT_QUEUE_URL"]
LOG_BUCKET = os.environ["LOG_BUCKET"]

GITLAB_USERNAME = os.environ["GITLAB_USERNAME"]
GITLAB_TOKEN = os.environ["GITLAB_TOKEN"]

repo_dir = Path("/workspace/repo")
log_file = Path("/workspace/output.log")

s3 = boto3.client("s3", region_name="eu-north-1")
sqs = boto3.client("sqs")

def aws_diagnostics():
    log("Running AWS diagnostics...")

    try:
        identity = boto3.client("sts").get_caller_identity()
        log(f"AWS identity OK: {identity['Arn']}")
    except Exception as e:
        log(f"AWS identity check failed: {e}")

    try:
        s3.list_buckets()
        log("S3 access OK")
    except botocore.exceptions.ClientError as e:
        log(f"S3 access error: {e}")

    try:
        sqs.get_queue_attributes(
            QueueUrl=RESULT_QUEUE_URL,
            AttributeNames=["QueueArn"]
        )
        log("SQS access OK")
    except botocore.exceptions.ClientError as e:
        log(f"SQS access error: {e}")

def log(msg):
    print(msg, flush=True)

def build_auth_repo_url():
    """
    Convert:
    https://gitlab.com/org/repo.git

    Into:
    https://username:token@gitlab.com/org/repo.git
    """

    if REPO.startswith("https://"):
        return REPO.replace(
            "https://",
            f"https://{GITLAB_USERNAME}:{GITLAB_TOKEN}@"
        )

    return REPO


def clone_repo():
    log(f"Cloning repo {REPO}")
    repo_url = build_auth_repo_url()

    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(repo_dir)],
        check=True
    )
    log("Clone completed")

def run_tests():
    log(f"Running command: {COMMAND}")

    with open(log_file, "w") as f:
        proc = subprocess.Popen(
            COMMAND,
            shell=True,
            cwd=repo_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            env=None,
        )

        for line in proc.stdout:
            print(line, end="")   # show in console
            f.write(line)        # save to log file

        proc.wait()

    return proc.returncode

def upload_logs():
    key = f"{BUILD_ID}.log"

    s3.upload_file(
        str(log_file),
        LOG_BUCKET,
        key
    )


def send_result(code):
    sqs.send_message(
        QueueUrl=RESULT_QUEUE_URL,
        MessageBody=str({
            "build_id": BUILD_ID,
            "exit_code": code
        })
    )


def main():

    aws_diagnostics()

    try:
        clone_repo()
        code = run_tests()
    except Exception:
        code = 1

    try:
        upload_logs()
    except Exception:
        pass

    try:
        send_result(code)
    except Exception:
        pass

    sys.exit(code)


if __name__ == "__main__":
    main()
