import { ChatType } from "@/shared/constants";

export function getMessageStyle(type?: ChatType) {
  switch (type) {
    case ChatType.System:
      return "text-gray-500 italic text-sm";
    case ChatType.Correct:
      return "text-green-600 font-semibold text-sm";
    case ChatType.RoundEnd:
      return "text-blue-600 font-semibold text-sm";
    default:
      return "text-gray-800 text-sm";
  }
}

export function getMessageIcon(type?: ChatType) {
  switch (type) {
    case ChatType.System:
      return "🔔";
    case ChatType.Correct:
      return "✅";
    case ChatType.RoundEnd:
      return "🏁";
    default:
      return "💬";
  }
}
