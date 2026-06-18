const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validatePassword(password) {
  if (!PASSWORD_REGEX.test(password)) {
    return '비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.';
  }
  return null;
}

export function validateUsername(username) {
  if (username.length < 2 || username.length > 20) {
    return '닉네임은 2~20자로 입력해주세요.';
  }
  return null;
}

export const API_BASE = 'http://localhost:5000';
