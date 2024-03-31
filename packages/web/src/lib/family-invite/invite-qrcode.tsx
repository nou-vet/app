import { createAsync } from '@solidjs/router';
import { createEffect, createSignal, Suspense } from 'solid-js';
import { Button, Card, Spinner, Text, tw } from '@nou/ui';
import type QRCodeStyling from 'styled-qr-code';

import { getFamilyInvite } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

export const FamilyInviteQRCode = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  // TODO: error handling
  const inviteData = createAsync(() => getFamilyInvite());
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(
    null,
  );
  const [consentShown, setConsentShown] = createSignal(true);

  async function share() {
    const shareData = {
      url: inviteData()?.url,
      title: t('family-invite.invite-share-title-no-name'),
      text: t('family-invite.invite-share-text'),
    } satisfies ShareData;
    await navigator.share(shareData);
  }

  let qrCode: QRCodeStyling;
  createEffect(() => {
    const data = inviteData()?.qrString;
    const container = containerRef();
    if (data && container) {
      // show fake QR code on the background while the consent is shown
      const content = consentShown() ? '0' : data;
      if (qrCode) {
        qrCode.update({ data: content });
      } else {
        createQRCode(content, container).then((instance) => {
          qrCode = instance;
        });
      }
    }
  });

  return (
    <div class="flex flex-col gap-6">
      <div class="flex size-full flex-col items-center justify-center gap-4">
        <Text as="p" class="text-balance text-center">
          {t('family-invite.qr-description')}
        </Text>
        <div class="stack size-[300px] shrink-0">
          <Card
            class={tw(
              'flex flex-col items-center justify-center bg-surface/[0.97] size-[324px] -m-3 backdrop-blur-sm gap-4',
              !consentShown() ? 'hidden' : undefined,
            )}
            variant="outlined"
          >
            <Text with="body">{t('family-invite.info-consent')}</Text>
            <Button
              size="sm"
              variant="link"
              onClick={() => {
                setConsentShown(false);
              }}
            >
              {t('family-invite.info-consent-accept')}
            </Button>
          </Card>
          <div class="stack size-[300px]">
            <div ref={setContainerRef} class="peer" />
            <div class="bg-tertiary/12 hidden size-full animate-pulse place-content-center rounded-2xl peer-empty:grid">
              <Spinner size="sm" variant="tertiary" />
            </div>
          </div>
        </div>
        <Suspense fallback={<div class="h-5" />}>
          <Text with="body-sm" tone="light">
            {t('family-invite.expires-in', {
              expiresIn: inviteData()?.expiresIn || '',
            })}
          </Text>
        </Suspense>
      </div>
      <Button variant="ghost" onClick={share}>
        {t('family-invite.cta-share')}
      </Button>
      <Button onClick={props.onNext}>{t('family-invite.cta-ready')}</Button>
    </div>
  );
};

async function createQRCode(data: string, containerRef: HTMLDivElement) {
  const QRCodeStyling = await import('styled-qr-code').then(
    (bundle) => bundle.default,
  );
  const qrImage = new QRCodeStyling({
    data,
    width: 300,
    height: 300,
    type: 'svg',
    image: `/icons/icon.svg`,
    dotsOptions: {
      color: 'var(--nou-on-surface)',
      type: 'rounded',
    },
    cornersSquareOptions: {
      color: 'var(--nou-on-surface)',
      type: 'extra-rounded',
    },
    backgroundOptions: {
      color: '#ffffff00',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 0,
    },
  });
  qrImage.append(containerRef);
  return qrImage;
}
