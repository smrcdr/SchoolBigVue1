import requests
import time
import random
import os
from pathlib import Path

API_URL = 'http://localhost:3000/api/'


def _auth_headers(access_token=None):
    if not access_token:
        return {}
    return {'Authorization': 'Bearer ' + access_token}


def register_request(name, password, invite=None):
    payload = {'name': name, 'pass': password}
    if invite is not None:
        payload['invite'] = invite
    return requests.post(API_URL + 'auth/register', json=payload)


def login_request(name, password):
    return requests.post(API_URL + 'auth/login', json={'name': name, 'pass': password})


def refresh_request(refresh_token):
    return requests.post(API_URL + 'auth/refresh', json={'refresh': refresh_token})


def logout_request(refresh_token):
    return requests.post(API_URL + 'auth/logout', json={'refresh': refresh_token})


def create_course_request(name, description, clas, duration, access_token=None):
    return requests.post(
        API_URL + 'courses',
        json={
            'name': name,
            'description': description,
            'class': clas,
            'duration': duration,
        },
        headers=_auth_headers(access_token),
    )


def create_course_bad_request(json_body, access_token=None):
    return requests.post(API_URL + 'courses', json=json_body, headers=_auth_headers(access_token))


def get_course_request(course_id, access_token=None):
    return requests.get(API_URL + 'courses/' + str(course_id), headers=_auth_headers(access_token))


def get_all_courses_request(access_token=None):
    return requests.get(API_URL + 'courses', headers=_auth_headers(access_token))


def delete_course_request(course_id, access_token=None):
    return requests.delete(API_URL + 'courses/' + str(course_id), headers=_auth_headers(access_token))


def update_course_request(course_id, parameter, value, access_token=None):
    return requests.patch(
        API_URL + 'courses/' + str(course_id),
        json={
            'parameter': parameter,
            'value': value,
        },
        headers=_auth_headers(access_token),
    )


def update_course_bad_request(course_id, json_body, access_token=None):
    return requests.patch(API_URL + 'courses/' + str(course_id), json=json_body, headers=_auth_headers(access_token))


def ping_request(access_token=None):
    return requests.get(API_URL + 'ping', headers=_auth_headers(access_token))


def _find_course_id(courses, name, description, clas, duration):
    matches = [
        c.get('id')
        for c in courses
        if c.get('name') == name
        and c.get('description') == description
        and c.get('class') == clas
        and int(c.get('duration')) == int(duration)
    ]
    return max(matches) if matches else None


def run_courses_api_tests():
    suffix = str(int(time.time())) + '_' + str(random.randint(1000, 9999))
    teacher_name = 'teacher_' + suffix
    student_name = 'student_' + suffix
    password = 'pass123'

    # Auth: register teacher + student
    def _read_dotenv_var(key):
        env_path = Path(__file__).resolve().parent.parent / '.env'
        if not env_path.exists():
            return None
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            if k.strip() != key:
                continue
            v = v.strip().strip('"').strip("'")
            return v
        return None

    invite = os.getenv('SECRET_INVITE') or _read_dotenv_var('SECRET_INVITE')
    assert invite is not None and len(invite) > 0

    reg_teacher = register_request(teacher_name, password, invite=invite)
    assert reg_teacher.status_code == 201
    assert reg_teacher.json().get('role') == 'teacher'

    reg_student = register_request(student_name, password)
    assert reg_student.status_code == 201
    assert reg_student.json().get('role') == 'student'
    print('Registration tests passed!')

    # Auth: duplicate user
    reg_dup = register_request(student_name, password)
    assert reg_dup.status_code == 409

    # Auth: login
    bad_login = login_request(student_name, 'wrong')
    assert bad_login.status_code == 401

    teacher_login = login_request(teacher_name, password)
    assert teacher_login.status_code == 200
    teacher_access = teacher_login.json().get('access')
    teacher_refresh = teacher_login.json().get('refresh')
    assert teacher_access and teacher_refresh

    student_login = login_request(student_name, password)
    assert student_login.status_code == 200
    student_access = student_login.json().get('access')
    student_refresh = student_login.json().get('refresh')
    assert student_access and student_refresh
    print('Login tests passed!')

    # Ping: must be protected
    ping_no_auth = ping_request()
    assert ping_no_auth.status_code == 401

    ping_resp = ping_request(teacher_access)
    assert ping_resp.status_code == 200
    assert ping_resp.json().get('status') == 'ok'
    print('Ping tests passed!')

    # Refresh: rotation
    refresh_resp = refresh_request(student_refresh)
    assert refresh_resp.status_code == 200
    new_access = refresh_resp.json().get('access')
    new_refresh = refresh_resp.json().get('refresh')
    assert new_access and new_refresh and new_refresh != student_refresh

    refresh_old_again = refresh_request(student_refresh)
    assert refresh_old_again.status_code == 401

    logout_resp = logout_request(new_refresh)
    assert logout_resp.status_code == 200

    refresh_after_logout = refresh_request(new_refresh)
    assert refresh_after_logout.status_code == 401
    print('Refresh/logout tests passed!')

    # Baseline count (teacher can list)
    all_before = get_all_courses_request(teacher_access)
    assert all_before.status_code == 200
    initial_count = len(all_before.json())

    # Student can list but cannot mutate
    list_student = get_all_courses_request(student_access)
    assert list_student.status_code == 200

    create_student = create_course_request('X', 'Y', '5H', 1, access_token=student_access)
    assert create_student.status_code == 403

    patch_student = update_course_request(1, 'name', 'Nope', access_token=student_access)
    assert patch_student.status_code == 403

    del_student = delete_course_request(1, access_token=student_access)
    assert del_student.status_code == 403
    print('Role tests passed!')

    # Create
    course_response1 = create_course_request('Test Course1', 'descCourse1', '5H', 1488, access_token=teacher_access)
    course_response2 = create_course_request('Test Course2', 'descCourse2', '50H', 52, access_token=teacher_access)
    assert course_response1.status_code == 200
    assert course_response2.status_code == 200
    print('Course creation tests passed!')

    # Validate creation by listing and capturing ids
    all_after = get_all_courses_request(teacher_access)
    assert all_after.status_code == 200
    courses = all_after.json()
    assert len(courses) >= initial_count + 2
    course_id1 = _find_course_id(courses, 'Test Course1', 'descCourse1', '5H', 1488)
    course_id2 = _find_course_id(courses, 'Test Course2', 'descCourse2', '50H', 52)
    assert course_id1 is not None and course_id2 is not None

    # Get by id
    get_resp = get_course_request(course_id1, teacher_access)
    assert get_resp.status_code == 200
    body = get_resp.json()
    assert body.get('name') == 'Test Course1'
    assert body.get('description') == 'descCourse1'
    assert body.get('class') == '5H'
    assert int(body.get('duration')) == 1488
    print('Get course by id tests passed!')

    # Get by id with invalid id format
    invalid_get = requests.get(API_URL + 'courses/abc', headers=_auth_headers(teacher_access))
    assert invalid_get.status_code == 400

    # Update
    upd_resp = update_course_request(course_id1, 'name', 'Updated Course1', access_token=teacher_access)
    assert upd_resp.status_code == 200
    verify = get_course_request(course_id1, teacher_access)
    assert verify.status_code == 200
    assert verify.json().get('name') == 'Updated Course1'
    print('Update course tests passed!')

    # Update bad payload
    bad_upd = update_course_bad_request(course_id1, {}, access_token=teacher_access)
    assert bad_upd.status_code == 400

    # Validation: bad create payloads
    bad_create_1 = create_course_bad_request({'name': 'X'}, access_token=teacher_access)
    assert bad_create_1.status_code == 400
    bad_create_2 = create_course_bad_request({
        'name': 'X',
        'description': 'Y',
        'class': 'Z',
        'duration': 'not_a_number',
    }, access_token=teacher_access)
    assert bad_create_2.status_code == 400
    print('Validation tests passed!')

    # Delete
    del_resp1 = delete_course_request(course_id1, access_token=teacher_access)
    assert del_resp1.status_code == 200
    confirm_deleted = get_course_request(course_id1, teacher_access)
    assert confirm_deleted.status_code == 404

    # Delete second
    del_resp2 = delete_course_request(course_id2, access_token=teacher_access)
    assert del_resp2.status_code == 200
    print('Delete course tests passed!')

    print('All tests passed!')


if __name__ == '__main__':
    run_courses_api_tests()
