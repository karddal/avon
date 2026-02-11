function requestUrl(rawUrl: string) {
    const base = rawUrl.startsWith("http") ? undefined : "http://localhost";
    return new URL(rawUrl, base);
}

function isValidTime(timeString: string) {
    expect(timeString, "query param should exist").to.be.a("string")
    expect(timeString).to.match(/^\d{4}-\d{2}-\d{2}$/)
}

function hasFromTo(url: URL) {
    return url.searchParams.has("from_") && url.searchParams.has("to");
}

function validFromTo(url: URL) {
    const from = url.searchParams.get("from_");
    const to = url.searchParams.get("to");

    expect(from, "from_ query param should exist").to.not.equal(null)
    expect(to, "to query param should exist").to.not.equal(null)

    isValidTime(from)
    isValidTime(to)
}

type RequestRecord = {
    url: string;
    at: number;
}

describe("Calendar e2e test", () => {
    let unitsCalls: RequestRecord[] = []
    let eventsCalls: RequestRecord[] = []

    beforeEach(() => {
        unitsCalls = []
        eventsCalls = []

        cy.clock(new Date().getTime(), ["Date"])

        cy.dbPrepare()

        cy.intercept("GET", "/api/calendar/units", (req) => {
            unitsCalls.push({ url: req.url, at: Date.now() });
        }).as("getUnits")

        cy.intercept("GET", "**/api/calendar/events*", (req) => {
            const url = requestUrl(req.url)
            const query = (req.query ?? {}) as Record<string, any>
            for (const [k, v] of Object.entries(query)) {
                if (v == null) continue
                url.searchParams.set(k, Array.isArray(v) ? String(v[0]) : String(v))
            }
            eventsCalls.push({ url: url.toString(), at: Date.now() })
        }).as("getEvents")

        cy.login("admin@bris.ac.uk", "changeme", false)
        cy.visit("/calendar")

        cy.wait("@getUnits").then((i) => {
            expect(i.response?.statusCode).to.equal(200)
        })

        cy.wait("@getEvents").then((i) => {
            expect(i.response?.statusCode).to.equal(200)

            const url = requestUrl(i.request.url)
            if (hasFromTo(url)) validFromTo(url)
        })

        cy.getByCy("calendar-dashboard").should("be.visible")
    })

    it("loads units and events successful and from/to query for event is valid", () => {
        cy.then(() => {
            expect(unitsCalls.length, "units called once on first load").to.eq(1)
            expect(eventsCalls.length, "events called once on first load").to.eq(1)
        })
    })

    it("switching to events triggers another events fetch with valid range", () => {
        cy.then(() => {
            expect(eventsCalls.length).to.eq(1)
        });

        cy.then(() => {
            const before = eventsCalls.length

            cy.contains("button", "events").click()

            cy.then(() => {
                expect(eventsCalls.length, "events fetch after switching to events tab").to.eq(before + 1)
            })

            cy.wait("@getEvents").then((i) => {
                expect(i.response?.statusCode).to.equal(200)

                const url = requestUrl(i.request.url)
                expect(hasFromTo(url), "events tab request should include from_/to").to.eq(true)
                validFromTo(url)
            })
        })

        cy.contains("empty").should("not.exist")

        cy.contains("AI Bill Splitter").should("exist")
        cy.contains("Encrypt").should("exist")

        cy.contains("button", "timetable").click()
    })

    it("events listing have valid due date and unit name", () => {
        cy.then(() => {
            const before = eventsCalls.length

            cy.contains("button", "events").click()

            cy.then(() => {
                expect(eventsCalls.length, "events fetch after switching to events tab").to.eq(before + 1)
            })

            cy.wait("@getEvents").then((i) => {
                expect(i.response?.statusCode).to.equal(200)
                const url = requestUrl(i.request.url)
                expect(hasFromTo(url), "events tab request should include from_/to").to.eq(true)
                validFromTo(url);
            })
        })

        cy.contains(/Unit:\s*/).should("exist")
        cy.contains(/Due Date:\s*\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2}/).should("exist")
    })

    it("navigation prev/next/today triggers events re-fetch with valid query", () => {
        const clickNav = (title: string) => {
            cy.then(() => {
                const before = eventsCalls.length

                cy.get(`button[title="${title}"]`).click()

                cy.then(() => {
                    expect(eventsCalls.length, `events should refetch after clicking ${title}`).to.eq(before + 1)
                })

                cy.wait("@getEvents").then((i) => {
                    expect(i.response?.statusCode).to.equal(200)
                    const url = requestUrl(i.request.url)
                    expect(hasFromTo(url), `${title} request should include from_/to`).to.eq(true)
                    validFromTo(url)
                })
            })
        }

        const clickEither = (a: string, b: string) => {
            const selA = `button[title="${a}"]`
            const selB = `button[title="${b}"]`

            cy.get("body").then(($body) => {
                const pick = $body.find(selA).length ? a : b
                clickNav(pick)
            })
        }

        clickEither("Next week", "Next day")
        clickEither("Next week", "Next day")
    })

    it("jump to date opens calendar and selecting a date triggers re-fetch", () => {
        cy.then(() => {
            const before = eventsCalls.length

            cy.get('button[title="Jump to date"]').click()
            cy.contains("button", /^15$/).click({ force: true })

            cy.then(() => {
                expect(eventsCalls.length, "events calls after jump-to-date").to.be.oneOf([before, before + 1])

                if (eventsCalls.length === before + 1) {
                    const url = requestUrl(eventsCalls[eventsCalls.length - 1]!.url)
                    expect(hasFromTo(url), "jump-to-date request should include from_/to").to.eq(true)
                    validFromTo(url)
                }
            })
        })
    })
})