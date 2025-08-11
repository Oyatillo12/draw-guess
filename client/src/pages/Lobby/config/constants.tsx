import { CreateTab, JoinTab } from "../ui/Tabs";

export const features = [
  { icon: "🎨", label: "Draw & Guess" },
  { icon: "👥", label: "Multiplayer" },
  { icon: "🏆", label: "Score System" },
];

export const enum LobbyTabKeys {
  Create = "create",
  Join = "join",
}

export const tabs = [
  {
    key: LobbyTabKeys.Create,
    icon: "✨",
    label: "Create Room",
    content: <CreateTab />,
  },
  {
    key: LobbyTabKeys.Join,
    icon: "🔗",
    label: "Join Room",
    content: <JoinTab />,
  },
];
