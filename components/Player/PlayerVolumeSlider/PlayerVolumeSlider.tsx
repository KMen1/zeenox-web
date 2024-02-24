import { setVolume } from "@/components/actions";
import { withNotification } from "@/components/withNotification";
import { botTokenAtom, volumeAtom } from "@/utils/atoms";
import { Group, Slider } from "@mantine/core";
import { IconVolume2 } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import classes from "./PlayerVolumeSlider.module.css";

export function PlayerVolumeSlider() {
  const token = useAtomValue(botTokenAtom);
  const volume = useAtomValue(volumeAtom);
  const [volumeLocal, setVolumeLocal] = useState(volume);

  useEffect(() => {
    setVolumeLocal(volume);
  }, [volume]);

  return (
    <Group wrap="nowrap" gap={7} w={150}>
      <IconVolume2 size={25} color="white" />
      <Slider
        color="blue"
        size={4}
        value={volumeLocal ?? 0}
        onChange={(v) => setVolumeLocal(v)}
        onChangeEnd={async (v) => withNotification(await setVolume(token, v))}
        w="100%"
        classNames={classes}
      />
    </Group>
  );
}
