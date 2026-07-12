import copy
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from app import app, activities


@pytest.fixture(autouse=True)
def restore_activities():
    original = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(original)


def test_unregister_participant_from_activity():
    client = TestClient(app)
    activity_name = "Chess Club"
    participant_email = "michael@mergington.edu"

    response = client.delete(f"/activities/{activity_name}/participants/{participant_email}")

    assert response.status_code == 200
    assert f"Removed {participant_email}" in response.json()["message"]
    assert participant_email not in activities[activity_name]["participants"]
