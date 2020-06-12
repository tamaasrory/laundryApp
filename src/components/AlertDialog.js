import React, {memo} from 'react';
import {Button, Dialog, Portal} from 'react-native-paper';

const AlertDialog = ({children, ...props}) => {
  return (
    <Portal>
      <Dialog
        visible={props.visible}
        onDismiss={props.onDismiss || false}
        dismissable={props.dismissable || false}>
        {props.title ? (
          <Dialog.Title style={{fontSize: 18}}>{props.title}</Dialog.Title>
        ) : null}
        {props.scrollable ? (
          <Dialog.ScrollArea>{children}</Dialog.ScrollArea>
        ) : (
          <Dialog.Content>{children}</Dialog.Content>
        )}
        {props.btnLeft || props.btnRight ? (
          <Dialog.Actions>
            {props.btnLeft ? (
              <Button onPress={props.btnLeft.onPress}>
                {props.btnLeft.title}
              </Button>
            ) : null}
            {props.btnRight ? (
              <Button onPress={props.btnRight.onPress}>
                {props.btnRight.title}
              </Button>
            ) : null}
          </Dialog.Actions>
        ) : null}
      </Dialog>
    </Portal>
  );
};

export default memo(AlertDialog);
