"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructive,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { botTokenAtom, resumeSessionAtom } from "@/stores/atoms";
import { Action } from "@/types/playerActions";
import { Player, Queue, Track } from "@/types/socket";
import { deletePreviousSession, resumePreviousSession } from "@/utils/actions";
import { IconClockPlay, IconTrash } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Payload, PayloadType } from "../types/socket";
import { useSetters } from "../utils/useSetters";
import { Track as TrackComponent } from "./Track/Track";

let socket: WebSocket | null = null;

export function Socket({ id, botToken }: { id: string; botToken: string }) {
  const setToken = useSetAtom(botTokenAtom);

  useEffect(() => {
    setToken(botToken);
  }, [botToken, setToken]);

  const [isDisconnectedOpen, setIsDisconnectedOpen] = useState(false);

  const setters = useSetters();
  const resumeSession = useAtomValue(resumeSessionAtom);

  useEffect(() => {
    function setPlayer(player: Player) {
      setters.setPosition(player.Position);
      setters.setState(player.State);
      setters.setListeners(player.Listeners);
      setters.setVolume(player.Volume);
      setters.setRepeat(player.TrackRepeatMode);
      setters.setAutoPlay(player.IsAutoPlayEnabled);
    }

    function setTrack(track: Track | null) {
      setters.setTrack(track);
    }

    function setQueue(queue: Queue) {
      setters.setQueue(queue.Tracks);
      setters.setHistory(queue.History.reverse());
    }

    function setActions(actions: Action[]) {
      setters.setActions(actions.reverse().slice(0, 10));
    }

    socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/api/v1/socket?id=${id}`,
    );
    socket.onopen = async () => {
      socket?.send(botToken);
      toast("Connected to server");
      setIsDisconnectedOpen(false);
    };
    socket.onclose = () => {
      setIsDisconnectedOpen(true);
    };
    socket.onmessage = async (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as Payload;
      const type = payload.Type as PayloadType;

      if (type & PayloadType.UpdatePlayer) {
        setPlayer(payload.State!);
      }
      if (type & PayloadType.UpdateTrack) {
        setTrack(payload.CurrentTrack!);
      }
      if (type & PayloadType.UpdateQueue) {
        setQueue(payload.Queue!);
      }
      if (type & PayloadType.UpdateActions) {
        setActions(payload.Actions!);
      }

      if (type & PayloadType.Initialize) {
        setters.setResumeSession(payload.ResumeSession!);
        setters.setStartedAt(payload.StartedAt!);
        setters.setChannelName(payload.VoiceChannelName!);
      }
    };
    return () => {
      socket?.close();
    };
  }, []);

  return (
    <>
      <AlertDialog open={isDisconnectedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnected from server!</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve been disconnected from the server. Please reconnect to
              continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                window.location.reload();
              }}
            >
              Reconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={resumeSession !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Available</AlertDialogTitle>
            <AlertDialogDescription>
              A resume session is available. Do you want to resume it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            {resumeSession?.CurrentTrack && (
              <div>
                <h3>Current Track</h3>
                <TrackComponent
                  track={resumeSession!.CurrentTrack}
                  mode="none"
                />
              </div>
            )}
            {resumeSession?.UpcomingFewTracks && (
              <div>
                <h3>Queue</h3>
                {resumeSession!.QueueLength > 0 ? (
                  <div className="flex flex-col">
                    {resumeSession!.UpcomingFewTracks.map((track) => (
                      <TrackComponent
                        key={track.Url}
                        track={track}
                        mode="none"
                      />
                    ))}
                    {resumeSession!.QueueLength >
                    resumeSession!.UpcomingFewTracks.length ? (
                      <span className="text-right">
                        and{" "}
                        {resumeSession!.QueueLength -
                          resumeSession!.UpcomingFewTracks.length}{" "}
                        more...
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogAction
              className="min-w-fit flex-1 gap-2"
              onClick={async () => await resumePreviousSession(botToken)}
            >
              <IconClockPlay size={20} />
              Resume
            </AlertDialogAction>
            <AlertDialogDestructive
              className="min-w-fit flex-1 gap-2"
              onClick={async () => {
                await deletePreviousSession(botToken);
                setters.setResumeSession(null);
              }}
            >
              <IconTrash size={20} /> Delete
            </AlertDialogDestructive>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
