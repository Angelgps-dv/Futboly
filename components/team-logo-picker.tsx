import { realTeamLogos } from '@/utils/real-team-logos';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomImage } from './custom/custom-image';

type IconPickerProps = {
  className?: string;
  getLogoId?: (selectedLogoId: string) => void;
};

// This component is based on the "real-team-logos" file, that contains some real logos since we are not managing custom logos yet
export const TeamLogoPicker = ({ className, getLogoId }: IconPickerProps) => {
  const title = 'Logo';

  const [selectedLogo, setSelectedLogo] = useState(realTeamLogos[0].id);
  const handleChange = (event: SelectChangeEvent) =>
    setSelectedLogo(event.target.value as string);

  useEffect(() => getLogoId?.(selectedLogo), [getLogoId]);

  return (
    <FormControl className={className}>
      <InputLabel>{title}</InputLabel>
      <Select
        value={selectedLogo}
        label={title}
        onChange={handleChange}
        className="h-[58px]"
      >
        {realTeamLogos.map((logo) => (
          <MenuItem value={logo.id} className="w-full flex justify-center">
            <CustomImage
              className="w-10 h-10"
              forceSrc={logo.src}
              forcedAlt={logo.alt}
              height={30}
              width={30}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
