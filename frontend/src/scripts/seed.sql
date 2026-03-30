-- jwks definition

CREATE TABLE "jwks" ("id" text not null primary key, "publicKey" text not null, "privateKey" text not null, "createdAt" date not null, "expiresAt" date);


-- programme definition

CREATE TABLE programme (
                           id UUID NOT NULL,
                           name VARCHAR NOT NULL,
                           start_date DATE NOT NULL,
                           end_date DATE NOT NULL,
                           gitlab_id VARCHAR NOT NULL,
                           PRIMARY KEY (id)
);


-- "user" definition

CREATE TABLE "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null, "role" text, "banned" integer, "banReason" text, "banExpires" date, "dashboard_layout" text);

-- "notification" definition
CREATE TABLE "notification" ("id" UUID not null primary key, "recipient_id" VARCHAR not null, "unit_id" UUID, "title" text not null, "body" text not null, "created_at" TIMESTAMP not null, "viewed" boolean not null);

-- verification definition

CREATE TABLE "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date not null, "updatedAt" date not null);

CREATE INDEX "verification_identifier_idx" on "verification" ("identifier");


-- account definition

CREATE TABLE "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null);

CREATE INDEX "account_userId_idx" on "account" ("userId");


-- "session" definition

CREATE TABLE "session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade, "impersonatedBy" text);

CREATE INDEX "session_userId_idx" on "session" ("userId");


-- unit definition

CREATE TABLE unit (
                      id UUID NOT NULL,
                      name VARCHAR NOT NULL,
                      description VARCHAR NOT NULL,
                      creation_date TIMESTAMP NOT NULL,
                      unit_code VARCHAR NOT NULL,
                      colour VARCHAR NOT NULL,
                      programme_id UUID NOT NULL,
                      gitlab_id VARCHAR NOT NULL,
                      unlocked BOOLEAN NOT NULL,
                      PRIMARY KEY (id),
                      FOREIGN KEY(programme_id) REFERENCES programme (id) ON DELETE CASCADE
);

CREATE INDEX ix_unit_name ON unit (name);
CREATE INDEX ix_unit_description ON unit (description);
CREATE INDEX ix_unit_unit_code ON unit (unit_code);


-- unitenrollment definition

CREATE TABLE unitenrollment (
                                unit_id UUID NOT NULL,
                                user_id VARCHAR NOT NULL,
                                type VARCHAR NOT NULL,
                                PRIMARY KEY (unit_id, user_id),
                                FOREIGN KEY(unit_id) REFERENCES unit (id)
);

-- base image definition

CREATE TABLE baseimage (
    id UUID NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    task_definition VARCHAR NOT NULL,
    is_active BOOLEAN NOT NULL,
    PRIMARY KEY (id)
);
-- coursework definition

CREATE TABLE coursework (
                            id UUID NOT NULL,
                            name VARCHAR NOT NULL,
                            description VARCHAR NOT NULL,
                            unit_id UUID NOT NULL,
                            due_date TIMESTAMP NOT NULL,
                            creation_date TIMESTAMP NOT NULL,
                            colour VARCHAR NOT NULL,
                            gitlab_id VARCHAR NOT NULL,
                            template_id INTEGER,
                            base_image_id UUID,
                            tester_command VARCHAR,
                            PRIMARY KEY (id),
                            CONSTRAINT unit_id
                                FOREIGN KEY (unit_id) REFERENCES unit (id)
                                ON DELETE CASCADE,
                            CONSTRAINT base_image_id
                                FOREIGN KEY (base_image_id) REFERENCES baseimage (id)
);

-- testrun definition
CREATE TABLE testrun (
    id UUID NOT NULL PRIMARY KEY,
    coursework_id UUID NOT NULL,
    ecs_task_arn VARCHAR NOT NULL,
    git_url VARCHAR NOT NULL,
    task_def VARCHAR NOT NULL,
    gitlab_repo_id VARCHAR NOT NULL,
    tester_command VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    dispatched_at DATE NOT NULL,
    completed_at DATE,
    trigger VARCHAR NOT NULL,
    created_at DATE NOT NULL,
    notifications_enabled BOOLEAN NOT NULL,
    CONSTRAINT coursework_id
        FOREIGN KEY (coursework_id) REFERENCES coursework (id)
        ON DELETE CASCADE
);

--testrunresult definition
CREATE TABLE testrunresult(
    test_run_id UUID PRIMARY KEY,
    exit_code INT NOT NULL,
    log_s3_uri VARCHAR NOT NULL,
    received_at DATE NOT NULL,
    CONSTRAINT test_run_id
        FOREIGN KEY (test_run_id) REFERENCES testrun(id)
        ON DELETE CASCADE
);

-- student repo definition

CREATE TABLE studentrepo (
    student_id VARCHAR NOT NULL,
    repo_url VARCHAR NOT NULL,
    cw_id UUID NOT NULL,
    gl_repo_id VARCHAR NOT NULL,
    PRIMARY KEY (student_id, cw_id),
    CONSTRAINT cw_id
        FOREIGN KEY (cw_id) REFERENCES coursework(id)
        ON DELETE CASCADE
);

CREATE INDEX ix_coursework_name ON coursework (name);
CREATE INDEX ix_coursework_due_date ON coursework (due_date);
CREATE INDEX ix_coursework_unit_id ON coursework (unit_id);

INSERT INTO "user" (id,name,email,"emailVerified",image,"createdAt","updatedAt","role",banned,"banReason","banExpires") VALUES
                                                                                                                  ('8AteGbdJyVodlUBwQGSxcN7h58aKNjRe','Foo Bar','admin@bris.ac.uk',0,NULL,'2026-01-03T19:22:57.491Z','2026-01-03T19:22:57.491Z','admin',0,NULL,NULL),
                                                                                                                  ('xaegpXv0lUvOsYsjugz7g8zjrzCHiI60','Rohan Booth (Year 1)','rohan@bris.ac.uk',0,NULL,'2026-01-03T19:22:57.749Z','2026-01-03T19:22:57.749Z','user',0,NULL,NULL),
                                                                                                                  ('VLQvrE4gwqC9JGjE1uJNIVUUxcqt7cQ3','Charles Price (Year 1)','charles@bris.ac.uk',0,NULL,'2026-01-03T19:22:57.948Z','2026-01-03T19:22:57.948Z','user',0,NULL,NULL),
                                                                                                                  ('ZKT8bk57VK62LD6dxV2EgJasOfUDAidy','Josh (Year 2)','josh@bris.ac.uk',0,NULL,'2026-01-03T19:22:58.128Z','2026-01-03T19:22:58.128Z','user',0,NULL,NULL),
                                                                                                                  ('3w5k7h8ajrAownl24CAhDG3EOnleWpAA','Jack (Year 2)','jack@bris.ac.uk',0,NULL,'2026-01-03T19:22:58.366Z','2026-01-03T19:22:58.366Z','user',0,NULL,NULL),
                                                                                                                  ('w2sHUIT6tdX4BI5nWL5LnRMjf0K9NYix','One Lecturer','one@bris.ac.uk',0,NULL,'2026-01-03T19:22:58.537Z','2026-01-03T19:22:58.537Z','lecturer',0,NULL,NULL),
                                                                                                                  ('972ac4ugeobSVJMXtnA6kg5gjjdVnChj','Two Lecturer','two@bris.ac.uk',0,NULL,'2026-01-03T19:22:58.709Z','2026-01-03T19:22:58.709Z','lecturer',0,NULL,NULL),
                                                                                                                  ('Oa2fXEbuOLX1ppSLNzcHopSn1tvYgTNo','Three Lecturer','three@bris.ac.uk',0,NULL,'2026-01-03T19:22:58.887Z','2026-01-03T19:22:58.887Z','lecturer',0,NULL,NULL),
                                                                                                                  ('cVliv2WYp49VHTX8P4NfNHU74ZhBNwzW','Four Lecturer','four@bris.ac.uk',0,NULL,'2026-01-03T19:22:59.097Z','2026-01-03T19:22:59.097Z','lecturer',0,NULL,NULL),
                                                                                                                  ('JuP6rqIofgOwoEQQARdNRLJQ6htc6zea','Five Lecturer','five@bris.ac.uk',0,NULL,'2026-01-03T19:22:59.279Z','2026-01-03T19:22:59.279Z','lecturer',0,NULL,NULL);
INSERT INTO "user" (id,name,email,"emailVerified",image,"createdAt","updatedAt","role",banned,"banReason","banExpires") VALUES
                                                                                                                  ('IFvdr1GBzO6SCOiPswaPpHznqbeSOlnw','Six Lecturer','six@bris.ac.uk',0,NULL,'2026-01-03T19:22:59.468Z','2026-01-03T19:22:59.468Z','lecturer',0,NULL,NULL),
                                                                                                                  ('4xgSUVKUjrBgLBV5TYNtNxCEjNyQO8M1','Seven Lecturer','seven@bris.ac.uk',0,NULL,'2026-01-03T19:22:59.692Z','2026-01-03T19:22:59.692Z','lecturer',0,NULL,NULL);

INSERT INTO account (id,"accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope",password,"createdAt","updatedAt") VALUES
                                                                                                                                                                          ('S4VXsBTEthblq16clH3kHznyLdgRMd4j','8AteGbdJyVodlUBwQGSxcN7h58aKNjRe','credential','8AteGbdJyVodlUBwQGSxcN7h58aKNjRe',NULL,NULL,NULL,NULL,NULL,NULL,'d805200f8428947b5f31f3b93efa38c8:c61be16068d3f2758cc490eaec297951a98bca4386632f9894fb9d3cc12ccbf590dac1d77dd3c1129d25e4d7a3246f4488001777f62aedf2f9b711aef58d4655','2026-01-03T19:22:57.690Z','2026-01-03T19:22:57.690Z'),
                                                                                                                                                                          ('5whNCORQ7D8f6fBT6abl8dAvFYBg7fkD','xaegpXv0lUvOsYsjugz7g8zjrzCHiI60','credential','xaegpXv0lUvOsYsjugz7g8zjrzCHiI60',NULL,NULL,NULL,NULL,NULL,NULL,'57860594dbe2a2e4e21837dc6d754157:5713821b5d513472610e4aab123d2c004e3ce236636c7b8fba61606e8c63ab4d3595fde1be1ef9955dbee89245b25d5b743ffac205458c2b82802cd84ce1a972','2026-01-03T19:22:57.931Z','2026-01-03T19:22:57.931Z'),
                                                                                                                                                                          ('Qrd8RtKkBYkTGEESA3x6908YQamqId4v','VLQvrE4gwqC9JGjE1uJNIVUUxcqt7cQ3','credential','VLQvrE4gwqC9JGjE1uJNIVUUxcqt7cQ3',NULL,NULL,NULL,NULL,NULL,NULL,'06b3e007f345c19361435058020d6baf:6e5cebada0269ae16b13fe2ac8c25c6822820485294b7e24f40253561186c5f5d00ad3e47ea0dc01f12752c01a58bb8ff404f3fb0cd83886968af275fe6e665c','2026-01-03T19:22:58.117Z','2026-01-03T19:22:58.117Z');
INSERT INTO account (id,"accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope",password,"createdAt","updatedAt") VALUES
                                                                                                                                                                          ('XLk4o7WPSXLNqwiBIMViKlJl0iEmPiEm','ZKT8bk57VK62LD6dxV2EgJasOfUDAidy','credential','ZKT8bk57VK62LD6dxV2EgJasOfUDAidy',NULL,NULL,NULL,NULL,NULL,NULL,'7a3b9d82a50468c8dcfa497e92799530:7e77dfe5c65403b5fb3077b4e683bd64d56d49a4566696774f5b33c7b0dc76d622ef5e5e593d91f9e6f0a61c1eb26ea603ffa290452a46440b8f3224abda65fa','2026-01-03T19:22:58.306Z','2026-01-03T19:22:58.306Z'),
                                                                                                                                                                          ('HSoh2qdT8CGOq9ZTXWOXQ6PuDXOH6CMB','3w5k7h8ajrAownl24CAhDG3EOnleWpAA','credential','3w5k7h8ajrAownl24CAhDG3EOnleWpAA',NULL,NULL,NULL,NULL,NULL,NULL,'52c1ea4ae890a6856d0165c6c43a5680:9725228d90f0d3836d73aa28f66f1eeb01cc468acb9be86fc9d98da6d213c975560460b3b247d88087fad46ecf16463b438cf4eeb1ef26cdc4a793074e29ceb6','2026-01-03T19:22:58.521Z','2026-01-03T19:22:58.521Z'),
                                                                                                                                                                          ('P8gUP7DsNUwachReXcOhniW3VJMcKSgE','w2sHUIT6tdX4BI5nWL5LnRMjf0K9NYix','credential','w2sHUIT6tdX4BI5nWL5LnRMjf0K9NYix',NULL,NULL,NULL,NULL,NULL,NULL,'bb35beb7fd29fa892a6c04f1c0b261c3:5cd48c07f8bb19de504a066ee6f202fb269f40ebbf3897f3a7e8e4fd41318001a970ffa532de33a17c21f6405afbebfccc2458d49222d723948b56ce5a98218a','2026-01-03T19:22:58.693Z','2026-01-03T19:22:58.693Z'),
                                                                                                                                                                          ('IEF4EsVXoqP193t7D2jm5jtYSPTiRGmM','972ac4ugeobSVJMXtnA6kg5gjjdVnChj','credential','972ac4ugeobSVJMXtnA6kg5gjjdVnChj',NULL,NULL,NULL,NULL,NULL,NULL,'baff5089942c6f850fe8440a327caaf0:d0745ddadb93d5d5b008364f69c16ccdae5cc4c60bf3e7d48baba5f8aab4d55f2956b001bb53e27b106440c50b43451020ba3eec485e0d53c5be1cb994741ff1','2026-01-03T19:22:58.873Z','2026-01-03T19:22:58.873Z'),
                                                                                                                                                                          ('7u3ownEwShYEc7WSwiEu4khFZrElx8FL','Oa2fXEbuOLX1ppSLNzcHopSn1tvYgTNo','credential','Oa2fXEbuOLX1ppSLNzcHopSn1tvYgTNo',NULL,NULL,NULL,NULL,NULL,NULL,'266b68c73e4acefe9d2871d6cb03cc62:afec91262025781272e5d0fe9ba4dad13c08eb8dfe3ec56402b84132bf9e0269f5cf1610be41efc75ec48dd1486741bcc4864302da080cc742beb7feaf03b1b0','2026-01-03T19:22:59.072Z','2026-01-03T19:22:59.072Z'),
                                                                                                                                                                          ('dHHq2gerJ6WHk2MBTwkCQEDSlJMcObNZ','cVliv2WYp49VHTX8P4NfNHU74ZhBNwzW','credential','cVliv2WYp49VHTX8P4NfNHU74ZhBNwzW',NULL,NULL,NULL,NULL,NULL,NULL,'2af6266a64b51e4abbbf8470e27b6bec:79919e51f6454b20e190063e7fd996c98b5a68b8529534ffe643027b957138d9ecd05a8747f30ee436b0ae863e77bfb8d93535cf30aeca6e4d378bacabd0cffc','2026-01-03T19:22:59.249Z','2026-01-03T19:22:59.249Z'),
                                                                                                                                                                          ('VEZvRZsEN9WsLYyANFirjTJn72jMUfJ9','JuP6rqIofgOwoEQQARdNRLJQ6htc6zea','credential','JuP6rqIofgOwoEQQARdNRLJQ6htc6zea',NULL,NULL,NULL,NULL,NULL,NULL,'eb937221bdebe78f1a4b6881246c2550:2496e557b9703215c5e90b76974a221b933f02d40228719f19a6c6b29a6154d3f8aea9cc7c6141a1a964287453e28ab14b7fa901a65eb15779e15d25cc7fa925','2026-01-03T19:22:59.452Z','2026-01-03T19:22:59.452Z'),
                                                                                                                                                                          ('pX5hOofgWxJhupteDRuLAF0yed0Cx5q6','IFvdr1GBzO6SCOiPswaPpHznqbeSOlnw','credential','IFvdr1GBzO6SCOiPswaPpHznqbeSOlnw',NULL,NULL,NULL,NULL,NULL,NULL,'fbfea13e3dd89d9981f2d11c529efa05:f54eaa7cd35cf833030597a815118611eca48d88e15fdf0122b600764747769cb64dd4bbed44df72ab6b3872d7c36c57fcfe100bec5c93eaa5a695c2ba00c979','2026-01-03T19:22:59.627Z','2026-01-03T19:22:59.627Z'),
                                                                                                                                                                          ('ZWSVSewBew0W0xQWwm0ZwaVIuiX2BcBq','4xgSUVKUjrBgLBV5TYNtNxCEjNyQO8M1','credential','4xgSUVKUjrBgLBV5TYNtNxCEjNyQO8M1',NULL,NULL,NULL,NULL,NULL,NULL,'814b1bfb105f3506a0da8cc0ebc15df0:87eede6301ae492d938f312ec7acd48b4b385feb11a1d3781b7c4f9e36dadf7507bd08cde68a4b5c4fa4b4406a2a6b864171a645523a6b1cea486f412f19f119','2026-01-03T19:22:59.854Z','2026-01-03T19:22:59.854Z');
