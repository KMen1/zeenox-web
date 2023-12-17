"use client";

import { PlayerState, RepeatMode } from "@/types";
import {
  faBackwardStep,
  faCirclePause,
  faCirclePlay,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Center, Flex, Group, Popover, Skeleton, Slider } from "@mantine/core";
import { usePlayerState } from "../../Providers/PlayerStateProvider";
import {
  IconExclamationCircle,
  IconPlayerPlayFilled,
  IconPlayerTrackPrevFilled,
  IconRepeat,
  IconRepeatOff,
  IconRepeatOnce,
  IconVolume,
} from "@tabler/icons-react";
import { usePlayerRepeatMode } from "../../Providers/PlayerRepeatModeProvider";
import { useActions } from "@/components/Providers/ActionProvider";
import classes from "./PlayerControls.module.css";
import {
  showNotification,
  updateNotification,
} from "@/utils/notificationUtils";
import { PlayerVolumeSlider } from "../PlayerVolumeSlider/PlayerVolumeSlider";

export function PlayerControls() {
  const state = usePlayerState();
  const { repeatMode } = usePlayerRepeatMode();
  const { backTrack, skipTrack, pause, resume, cycleRepeatMode } = useActions();

  function back() {
    const id = `back-${Date.now()}`;
    showNotification(id, "Rewinding to previous track", null, true);
    backTrack().then((res) => {
      if (res.success) {
        updateNotification(
          id,
          "Rewound to previous track",
          <IconPlayerTrackPrevFilled />,
          "green",
          "Successfully rewound to previous track!"
        );
      } else {
        updateNotification(
          id,
          "Failed to rewind to previous track",
          <IconExclamationCircle />,
          "red",
          res.error!
        );
      }
    });
  }

  function next() {
    const id = `next-${Date.now()}`;
    showNotification(id, "Skipping to next track", null, true);
    skipTrack().then((res) => {
      if (res.success) {
        updateNotification(
          id,
          "Skipped to next track",
          <IconPlayerTrackPrevFilled />,
          "green",
          "Successfully skipped to next track!"
        );
      } else {
        updateNotification(
          id,
          "Failed to skip to next track",
          <IconExclamationCircle />,
          "red",
          res.error!
        );
      }
    });
  }

  function repeat() {
    const id = `repeat-${Date.now()}`;
    showNotification(id, "Changing repeat mode", null, true);
    cycleRepeatMode().then((res) => {
      if (res.success) {
        updateNotification(
          id,
          "Repeat mode changed",
          <IconRepeat />,
          "green",
          `Successfully changed repeat mode`
        );
      } else {
        updateNotification(
          id,
          "Failed to change repeat mode",
          <IconExclamationCircle />,
          "red",
          res.error!
        );
      }
    });
  }

  function pauseOrResume() {
    const id = `pause-resume-${Date.now()}`;
    if (state === PlayerState.Playing) {
      showNotification(id, "Pausing playback", null, true);
      pause().then((res) => {
        if (res.success) {
          updateNotification(
            id,
            "Paused playback",
            <IconPlayerPlayFilled />,
            "green",
            "Successfully paused playback!"
          );
        } else {
          updateNotification(
            id,
            "Failed to pause playback",
            <IconExclamationCircle />,
            "red",
            res.error!
          );
        }
      });
    } else {
      showNotification(id, "Resuming playback", null, true);
      resume().then((res) => {
        if (res.success) {
          updateNotification(
            id,
            "Resumed playback",
            <IconPlayerPlayFilled />,
            "green",
            "Successfully resumed playback!"
          );
        } else {
          updateNotification(
            id,
            "Failed to resume playback",
            <IconExclamationCircle />,
            "red",
            res.error!
          );
        }
      });
    }
  }

  if (repeatMode === undefined)
    return (
      <>
        <Group gap={15}>
          <Skeleton circle w={16} h={16} />
          <Skeleton circle w={20} h={32} />
          <Skeleton circle w={45} h={45} />
          <Skeleton circle w={20} h={32} />
          <Skeleton circle w={16} h={16} />
        </Group>
      </>
    );

  return (
    <Center>
      <Flex gap={15} align="center">
        <Flex align="center" gap={15}>
          {repeatMode === RepeatMode.None && (
            <IconRepeatOff
              size="1rem"
              color="white"
              role="button"
              onClick={repeat}
              className={classes.controlIcon}
            />
          )}
          {repeatMode === RepeatMode.Track && (
            <IconRepeatOnce
              size="1rem"
              color="white"
              role="button"
              onClick={repeat}
              className={classes.controlIcon}
            />
          )}
          {repeatMode === RepeatMode.Queue && (
            <IconRepeat
              size="1rem"
              color="white"
              role="button"
              onClick={repeat}
              className={classes.controlIcon}
            />
          )}
          <FontAwesomeIcon
            icon={faBackwardStep}
            color="white"
            size="2xl"
            role="button"
            onClick={back}
            className={classes.controlIcon}
          />
          {state === PlayerState.Playing ? (
            <FontAwesomeIcon
              icon={faCirclePause}
              color="white"
              size="3x"
              role="button"
              onClick={pauseOrResume}
              className="transition-all duration-100 ease-in-out hover:text-gray-300"
            />
          ) : (
            <FontAwesomeIcon
              icon={faCirclePlay}
              color="white"
              size="3x"
              role="button"
              onClick={pauseOrResume}
              className="transition-all duration-100 ease-in-out hover:text-gray-300"
            />
          )}
          <FontAwesomeIcon
            icon={faForwardStep}
            color="white"
            size="2xl"
            role="button"
            onClick={next}
            className={classes.controlIcon}
          />
        </Flex>
        <Popover width={150} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <IconVolume
              size="1.1rem"
              color="white"
              role="button"
              className={classes.controlIcon}
            />
          </Popover.Target>
          <Popover.Dropdown>
            <PlayerVolumeSlider />
          </Popover.Dropdown>
        </Popover>
      </Flex>
    </Center>
  );
}
