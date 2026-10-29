# src/assets/images/team/

Place all verified resident stylist and academy educator portrait photos here.
Supported formats: .jpg, .jpeg, .png, .webp

## What to place here:
- Headshots / portraits of salon stylists
- Headshots / portraits of academy educators

## File Naming Convention:
Name images matching the stylist's first and last name in lowercase, separated by a hyphen:

Examples:
- rahul-sharma.jpg
- priya-patil.jpg
- mohit-deshmukh.jpg

In src/data/site.js, reference this filename directly in the member's photo property:
photo: "rahul-sharma.jpg"

## Photo Guidelines:
- Professional, sharp portrait with clean focus on face and shoulders
- Consistent neutral, dark, or warm salon studio background
- Orientation: Vertical portrait (4:5 or 3:4 aspect ratio recommended)
- Recommended resolution: 800x1000px, under 400KB
- Fallback: If no photo is provided, the card automatically displays an elegant monogram avatar using the member's initials.
