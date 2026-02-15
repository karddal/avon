from typing import List

from urllib.parse import urlparse, parse_qs, urlencode

import httpx

from bs4 import BeautifulSoup

from app.schemas.structure import (
    PreviewPayload,
    ProgrammePreview,
    UnitPreview
)


def parse_table_rows(table) -> List[UnitPreview]:
    units = []
    base_url = "https://www.bris.ac.uk/unit-programme-catalogue/"

    rows = table.find_all('tr')[1:]

    for row in rows:
        cols = row.find_all('td')

        if len(cols) < 5 or not cols[1].text.strip():
            continue

        link_tag = cols[0].find('a')
        if not link_tag or 'href' not in link_tag.attrs:
            continue

        raw_credits = cols[2].text.strip().split()[0]

        href = link_tag['href']
        full_link = href if href.startswith('http') else f"{base_url}{href}"

        units.append(UnitPreview(
            name=link_tag.text.strip(),
            code=cols[1].text.strip(),
            credits=int(raw_credits) if raw_credits.isdigit() else 0,
            status=cols[3].text.strip(),
            teaching_block=cols[4].text.strip(),
            link=full_link
        ))
    return units


async def scrape_full_programme(payload: PreviewPayload) -> List[ProgrammePreview]:
    initial_url = str(payload.link).strip()
    target_years = payload.years

    parsed = urlparse(initial_url)
    params = parse_qs(parsed.query)

    prog_code = params.get('programmeCode', [""])[0]
    ayr_code = params.get('ayrCode', [""])[0]

    if not prog_code or not ayr_code:
        print(f"DEBUG: Failed to parse URL. Prog: {prog_code}, Ayr: {ayr_code}")
        return []

    raw_year = ayr_code.replace("/", "-")
    formatted_ayr = f"20{raw_year[:2]}-20{raw_year[3:]}"

    year_parts = ayr_code.split("/")
    start_year = int(f"20{year_parts[0]}")
    end_year = int(f"20{year_parts[1]}")

    all_years = []
    page_title = ""

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
        for level in target_years:
            query_params = {
                "byCohort": "N",
                "routeLevelCode": level,
                "ayrCode": ayr_code,
                "programmeCode": prog_code,
                "modeOfStudyCode": "Full Time"
            }
            target_url = f"https://www.bris.ac.uk/unit-programme-catalogue/RouteStructure.jsa?{urlencode(query_params)}"

            try:
                response = await client.get(target_url, timeout=10.0)
                if response.status_code != 200:
                    continue

                soup = BeautifulSoup(response.text, 'html.parser')

                if not page_title:
                    title_h1 = soup.find('h1')
                    if title_h1:
                        full_text = title_h1.get_text(" ", strip=True)
                        page_title = full_text.replace("Programme structure:", "").split('-')[0].strip()
                    else:
                        page_title = "Programme"

                table = soup.find('table')
                if not table or "Unit name" not in table.text:
                    continue

                year_units = parse_table_rows(table)

                if year_units:
                    all_years.append(ProgrammePreview(
                        programme_name=f"Year {level} {page_title} {formatted_ayr}",
                        start_year=start_year,
                        end_year=end_year,
                        units=year_units
                    ))
            except Exception as e:
                print(f"DEBUG: Error fetching Year {level}: {e}")
                continue

    return all_years