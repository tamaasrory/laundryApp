export const emailValidator = email => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) {
    return 'Tidak boleh kosong.';
  }
  if (!re.test(email)) {
    return 'Ooops! alamat email tidak valid.';
  }

  return '';
};

export const passwordValidator = password => {
  var passRegex = new RegExp(
    '^(((?=.*[a-z])|(?=.*[A-Z]))(?=.*[0-9]))(?=.{6,})',
  );

  if (!password || password.length <= 0) {
    return 'Tidak boleh kosong.';
  }

  if (password.length < 6) {
    return 'Password Minimal 6 Karakter.';
  }

  if (!passRegex.test(password)) {
    return 'Password Harus Kombinasi Angka dan Huruf';
  }

  return '';
};

export const nameValidator = name => {
  if (!name || name.length <= 0) {
    return 'Tidak boleh kosong.';
  }

  return '';
};

export const noHpValidator = name => {
  if (!name || name.length <= 2) {
    return 'Tidak boleh kosong.';
  }

  return '';
};
