FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    git \
    ca-certificates \
    tini \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    uv \
    poetry \
    pytest \
    awscli \
    boto3 \
    botocore[crt]

# copy runner script
COPY runner.py /runner.py

# create user
RUN useradd -m grader

# give workspace permissions to grader
RUN mkdir -p /workspace && chown -R grader:grader /workspace

USER grader

ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["python","/runner.py"]
