import SInfo from 'react-native-sensitive-info';

class User {
  async getName() {
    return await SInfo.getItem('name', {});
  }

  async getNoHp() {
    return await SInfo.getItem('no_hp', {});
  }

  async isMember() {
    return await SInfo.getItem('isMember', {});
  }
}

export default User;
