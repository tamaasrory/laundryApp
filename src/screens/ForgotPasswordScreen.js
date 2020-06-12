import React, {memo, useState} from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {emailValidator} from '../core/utils';
import CenterContainer from '../components/CenterContainer';
import BackButton from '../components/BackButton';
import Logo from '../components/Logo';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';

const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState({value: '', error: ''});

  const _onSendPressed = () => {
    const emailError = emailValidator(email.value);

    if (emailError) {
      setEmail({...email, error: emailError});
      return;
    }

    navigation.navigate('LoginScreen');
  };
  console.info('#render : ', 'ForgotPasswordScreen.js');
  return (
    <CenterContainer>
      <BackButton goBack={() => navigation.navigate('LoginScreen')} />

      <Logo />
      <Paragraph>Silahkan masukkan alamat email untuk reset password</Paragraph>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={text => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <Button mode="contained" onPress={_onSendPressed} style={styles.button}>
        Kirim Permintaan
      </Button>

      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.label}>Kembali ke login</Text>
      </TouchableOpacity>
    </CenterContainer>
  );
};

const styles = StyleSheet.create({
  back: {
    width: '100%',
    marginTop: 12,
  },
  button: {
    marginTop: 12,
  },
  label: {
    color: theme.colors.secondary,
    width: '100%',
  },
});

export default memo(ForgotPasswordScreen);
