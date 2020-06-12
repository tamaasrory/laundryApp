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
  if (!password || password.length <= 0) {
    return 'Tidak boleh kosong.';
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
  if (!name || name.length <= 0) {
    return 'Tidak boleh kosong.';
  }

  return '';
};
