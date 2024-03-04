import { action, useSubmission } from '@solidjs/router';
import { Button, Icon, Popover, Text, TextField } from '@nou/ui';

import { loginDev } from '~/api/dev-login';

const loginDevAction = action(loginDev, 'login-dev');

const DevLogin = () => {
  const login = useSubmission(loginDevAction);
  return (
    <>
      <Button
        variant="ghost"
        popoverTarget="dev-login"
        icon
        label="Developer login"
      >
        <Icon use="carrot" />
      </Button>
      <Popover id="dev-login" class="w-[320px] p-8">
        <form method="post" action={loginDevAction} class="flex flex-col gap-4">
          <Text with="body-xl" class="text-center">
            Dev login
          </Text>
          <TextField name="name" label="Name" />
          <Button type="submit" loading={login.pending}>
            Login
          </Button>
        </form>
      </Popover>
    </>
  );
};

export default DevLogin;
