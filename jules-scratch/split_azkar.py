import json
import os
import sys

# --- Configuration ---
# Correct base URL using the user's provided repository information.
BASE_URL = "https://raw.githubusercontent.com/ahanafy41/The-Holy-Quran/data"

INPUT_JSON_PATH = "azkar-data/azkar.json"
OUTPUT_DIR = "azkar-data"
CATEGORIES_FILENAME = "azkar-categories.json"

# --- Main Script ---

def get_all_data():
    """Reads and returns the entire JSON data from the input file."""
    try:
        with open(INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {INPUT_JSON_PATH}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {INPUT_JSON_PATH}")
        return None

def create_categories_summary(all_data):
    """Creates the single azkar-categories.json file."""
    print("Creating categories summary file...")
    categories_summary = []
    for category_data in all_data:
        categories_summary.append({
            "id": category_data.get("id"),
            "category": category_data.get("category")
        })

    categories_summary_path = os.path.join(OUTPUT_DIR, CATEGORIES_FILENAME)
    try:
        with open(categories_summary_path, 'w', encoding='utf-8') as f:
            json.dump(categories_summary, f, ensure_ascii=False, indent=2)
        print(f"Successfully created categories summary file: {categories_summary_path}")
    except IOError as e:
        print(f"Error writing categories summary file: {e}")

def split_files_in_batch(all_data, start_id, end_id):
    """Splits a range of categories into individual files."""
    print(f"Processing categories from ID {start_id} to {end_id}...")

    for category_data in all_data:
        category_id = category_data.get("id")
        if category_id and start_id <= category_id <= end_id:
            # Process the array of dhikr for this category
            dhikr_array = category_data.get("array", [])

            # Update audio paths to be full URLs
            for dhikr in dhikr_array:
                original_audio_path = dhikr.get("audio")
                if original_audio_path:
                    clean_path = original_audio_path.lstrip('/')
                    # The full path in the repo is azkar-data/audio/filename.mp3
                    # So we construct the URL based on that.
                    dhikr["audio"] = f"{BASE_URL}/azkar-data/{clean_path}"

            # Write the individual category file
            output_category_path = os.path.join(OUTPUT_DIR, f"{category_id}.json")
            try:
                with open(output_category_path, 'w', encoding='utf-8') as f:
                    json.dump(dhikr_array, f, ensure_ascii=False, indent=2)
                print(f"  - Created category file: {output_category_path}")
            except IOError as e:
                print(f"Error writing file {output_category_path}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python split_azkar.py [categories|split] [start_id] [end_id]")
        return

    mode = sys.argv[1]
    all_data = get_all_data()
    if all_data is None:
        return

    if mode == "categories":
        # This part is already done, but keeping the logic for completeness
        create_categories_summary(all_data)
    elif mode == "split":
        if len(sys.argv) != 4:
            print("Usage for split mode: python split_azkar.py split <start_id> <end_id>")
            return
        try:
            start_id = int(sys.argv[2])
            end_id = int(sys.argv[3])
            split_files_in_batch(all_data, start_id, end_id)
        except ValueError:
            print("Error: start_id and end_id must be integers.")
    else:
        print(f"Error: Unknown mode '{mode}'. Use 'categories' or 'split'.")

if __name__ == "__main__":
    main()
