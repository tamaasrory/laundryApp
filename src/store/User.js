import SInfo from 'react-native-sensitive-info';

class User {
  async getName() {
    return await SInfo.getItem('name', {});
  }

  async getNoHp() {
    return await SInfo.getItem('no_hp', {});
  }

  async getEmail() {
    return await SInfo.getItem('email', {});
  }

  async isMember() {
    return await SInfo.getItem('isMember', {});
  }

  async request_upgrade_to_member() {
    return await SInfo.getItem('request_upgrade_to_member', {});
  }
}

export default User;
