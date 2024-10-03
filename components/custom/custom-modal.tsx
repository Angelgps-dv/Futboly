'use client';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { useState } from 'react';
import { CustomButton, CustomButtonProps } from './custom-button';
import { CustomImage } from './custom-image';

const cssStylesFullPage = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};

const cssStylesDialog = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
};

type CustomModalProps = {
  title: string | React.ReactNode; // Title is not necessary when hasOpenButton is false
  children: React.ReactNode;
  hasOpenButton?: boolean;
  externalStatus?: boolean;
  unboldedTitle?: string;
  className?: string;
  isDialog?: {
    value: boolean;
    style: 'slim' | 'large';
  };
  handleClose?: () => void;
  openButton?: {
    label: string;
    isText?: boolean;
    className?: string;
    handleClick?: () => void;
    style?: CustomButtonProps['style'];
  };
  closeButton?: {
    label: string;
    handleClick?: () => void;
    className?: string;
    disabled?: boolean;
    hide?: boolean;
    style?: CustomButtonProps['style'];
  };
};

export const CustomModal = ({
  title,
  children,
  hasOpenButton = true,
  externalStatus = false,
  unboldedTitle,
  className = '',
  handleClose,
  openButton,
  closeButton,
  isDialog = {
    value: false,
    style: 'large',
  },
}: CustomModalProps) => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => {
    handleClose?.();
    setOpen(false);
  };

  const handleModalClick = () => {
    openButton?.handleClick?.();
    openModal();
  };

  const handleButtonClose = () => {
    closeButton?.handleClick?.();
    closeModal();
  };

  const modalStatus = Boolean(hasOpenButton ? open : externalStatus);

  const fullPageClasses =
    'p-4 md:p-8 w-screen h-screen md:w-[70dvw] 2xl:w-[60dvw] md:h-[80dvh] ' +
    className;
  const dialogPageClasses = {
    slim:
      'p-4 md:p-10 min-w-[90vw] sm:min-w-[80vw] md:min-w-fit' + ' ' + className,
    large:
      'p-4 md:p-10 w-[90vw] sm:w-[85vw] md:w-[70dvw] xl:w-[60dvw]' +
      ' ' +
      className,
  };

  return (
    <>
      {hasOpenButton && !openButton?.isText && (
        <CustomButton
          label={openButton?.label || ''}
          className={`w-fit h-10 ${openButton?.className || ''}`}
          style={openButton?.style || 'black'}
          handleClick={handleModalClick}
        />
      )}
      {hasOpenButton && openButton?.isText && (
        <span
          className={openButton?.className || ''}
          onClick={handleModalClick}
        >
          {openButton?.label}
        </span>
      )}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalStatus}
        onClose={closeModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={modalStatus}>
          <Box
            sx={!isDialog.value ? cssStylesFullPage : cssStylesDialog}
            className={
              !isDialog.value
                ? fullPageClasses
                : dialogPageClasses[isDialog.style]
            }
          >
            <div className="flex flex-col gap-4 h-full">
              <div
                className={
                  'mx-2 flex align-center ' +
                  (typeof title !== 'string'
                    ? 'justify-between'
                    : 'justify-end')
                }
              >
                {typeof title !== 'string' && title}
                <CustomImage
                  imageKey="CLOSE_ICON"
                  width={20}
                  height={20}
                  onClick={hasOpenButton ? closeModal : handleClose}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-6">
                {typeof title === 'string' && (
                  <div className="flex justify-center text-3xl">
                    <div className="font-bold">{title}</div>
                    {unboldedTitle}
                  </div>
                )}
                <div className="h-full">{children}</div>
              </div>
              {closeButton?.hide !== true && (
                <CustomButton
                  label={closeButton?.label || ''}
                  handleClick={handleButtonClose}
                  disabled={closeButton?.disabled}
                  style={closeButton?.style || 'main'}
                />
              )}
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};
