from bs4 import BeautifulSoup
import pytest

from app.core.helpers import scraping
from app.schemas.structure import PreviewPayload


class FakeResponse:
    def __init__(self, status_code=200, text=""):
        self.status_code = status_code
        self.text = text


class FakeAsyncClient:
    def __init__(self, responses, *args, **kwargs):
        self.responses = list(responses)
        self.calls = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return self.responses.pop(0)


def test_parse_table_rows_extracts_valid_units_and_skips_invalid_rows():
    soup = BeautifulSoup(
        """
        <table>
          <tr><th>Unit name</th><th>Code</th><th>Credits</th><th>Status</th><th>TB</th></tr>
          <tr>
            <td><a href="unit.jsa?unitCode=COMS1">Software Engineering</a></td>
            <td>COMS10001</td><td>20 credits</td><td>Mandatory</td><td>TB1</td>
          </tr>
          <tr><td>No link</td><td>COMS10002</td><td>bad</td><td>Optional</td><td>TB2</td></tr>
          <tr><td><a href="https://example.com/unit">External</a></td><td>COMS10003</td><td>bad</td><td>Optional</td><td>TB2</td></tr>
        </table>
        """,
        "html.parser",
    )

    units = scraping.parse_table_rows(soup.find("table"))

    assert len(units) == 2
    assert units[0].name == "Software Engineering"
    assert units[0].credits == 20
    assert units[0].link.startswith(
        "https://www.bris.ac.uk/unit-programme-catalogue/"
    )
    assert units[1].credits == 0
    assert units[1].link == "https://example.com/unit"


@pytest.mark.asyncio
async def test_scrape_full_programme_returns_empty_for_invalid_link():
    result = await scraping.scrape_full_programme(
        PreviewPayload(link="https://example.com", years=[1])
    )

    assert result == []


@pytest.mark.asyncio
async def test_scrape_full_programme_fetches_requested_years(monkeypatch):
    html = """
      <html>
        <h1>Programme structure: Computer Science - BSc</h1>
        <table>
          <tr><th>Unit name</th><th>Code</th><th>Credits</th><th>Status</th><th>TB</th></tr>
          <tr>
            <td><a href="unit.jsa?unitCode=COMS1">Software Engineering</a></td>
            <td>COMS10001</td><td>20 credits</td><td>Mandatory</td><td>TB1</td>
          </tr>
        </table>
      </html>
    """
    fake_client = FakeAsyncClient(
        [
            FakeResponse(status_code=200, text=html),
            FakeResponse(status_code=500, text="bad"),
        ]
    )
    monkeypatch.setattr(
        scraping.httpx,
        "AsyncClient",
        lambda *args, **kwargs: fake_client,
    )

    result = await scraping.scrape_full_programme(
        PreviewPayload(
            link="https://www.bris.ac.uk/catalogue?programmeCode=ABC&ayrCode=25/26",
            years=[1, 2],
        )
    )

    assert len(result) == 1
    assert result[0].programme_name == "Year 1 Computer Science 2025-2026"
    assert result[0].start_year == 2025
    assert result[0].end_year == 2026
    assert result[0].units[0].code == "COMS10001"
