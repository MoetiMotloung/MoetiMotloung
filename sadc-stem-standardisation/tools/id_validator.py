#!/usr/bin/env python3
"""Validate and parse SADC Harmonised Identification Numbers (proposed).

Format (13 digits): YYMMDD SSS CC Z X  (see framework/identification.json)
  - digits 1-6:  date of birth (YYMMDD)
  - digits 7-9:  per-day/per-country sequence number (no demographic meaning)
  - digits 10-11: 2-digit SADC member state country code (framework/countries.json numericCode)
  - digit 12:    Luhn check digit over digits 1-11
  - digit 13:    sex identifier, ISO/IEC 5218 (0=not known, 1=male, 2=female, 9=not applicable)

Built on South Africa's Home Affairs ID model (embedded birth date + Luhn
checksum), extended with a regional country code and a standardised sex
digit at the end.

This is a format-compliance utility only -- it does not look up, store, or
identify any real person. Use synthetic/test numbers only; never pass a
real person's ID number to a shared or logged tool like this.

Usage:
    python3 tools/id_validator.py <13-digit-number>
"""
import argparse
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SEX_CODES = {"0": "not_known", "1": "male", "2": "female", "9": "not_applicable"}


def luhn_check_digit(payload: str) -> int:
    """Standard Luhn check digit for an arbitrary-length digit string."""
    total = 0
    # Double every second digit counting from the rightmost payload digit.
    for i, ch in enumerate(reversed(payload)):
        d = int(ch)
        if i % 2 == 0:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return (10 - (total % 10)) % 10


def load_country_by_numeric_code():
    countries = json.loads((ROOT / "framework" / "countries.json").read_text(encoding="utf-8"))
    return {c["numericCode"]: c for c in countries}


def parse_id(id_number: str) -> dict:
    result = {"input": id_number, "valid": False, "errors": []}

    if not id_number.isdigit() or len(id_number) != 13:
        result["errors"].append("must be exactly 13 digits")
        return result

    expected_check = luhn_check_digit(id_number[0:11])
    actual_check = int(id_number[11])
    if expected_check != actual_check:
        result["errors"].append(
            f"checksum mismatch: expected {expected_check}, got {actual_check}"
        )

    yy, mm, dd = int(id_number[0:2]), int(id_number[2:4]), int(id_number[4:6])
    today = datetime.date.today()
    century = 2000 if yy <= (today.year % 100) else 1900
    try:
        birth_date = datetime.date(century + yy, mm, dd)
    except ValueError:
        result["errors"].append(f"invalid birth date in digits 1-6: {id_number[0:6]}")
        birth_date = None

    sequence = id_number[6:9]
    country_code = id_number[9:11]
    countries_by_code = load_country_by_numeric_code()
    country = countries_by_code.get(country_code)
    if country is None:
        result["errors"].append(f"unknown country code: {country_code}")

    sex_digit = id_number[12]
    sex = SEX_CODES.get(sex_digit, "unknown")

    result["valid"] = len(result["errors"]) == 0
    result["birth_date"] = birth_date.isoformat() if birth_date else None
    result["age_years"] = (today - birth_date).days // 365 if birth_date else None
    result["sequence"] = sequence
    result["country_code"] = country_code
    result["country_name"] = country["name"] if country else None
    result["sex"] = sex
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("id_number", help="13-digit ID number (synthetic/test only)")
    args = parser.parse_args()

    result = parse_id(args.id_number)
    for key, value in result.items():
        print(f"{key}: {value}")
    sys.exit(0 if result["valid"] else 1)


if __name__ == "__main__":
    main()
