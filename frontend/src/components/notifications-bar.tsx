import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationMessage from "./notification-message";

export default function NotificationBar() {
  const apiCall = [
    {
      id: 0,
      title: "Surprise Algo Coursework!",
      day: "Wednesday",
      time: "9:00 AM",
      from: "Christian Konrad",
      message:
        "Surprise! you have to solve the ICPC 2025 paper by friday. This is assignment is worth 50% of your grade.",
      read: false,
    },
    {
      id: 1,
      title: "Concurrency Lecture Update",
      day: "Tuesday",
      time: "10:30 AM",
      from: "Sion Hannuna",
      message:
        "Tomorrow's lecture will cover goroutines and synchronization primitives — please review last week's concurrency notes before class.",
      read: false,
    },
    {
      id: 2,
      title: "Data and Algorithms",
      day: "Wednesday",
      time: "2:00 PM",
      from: "Majid Mirmehdi",
      message:
        "Please ensure your assignment on graph traversal is submitted by midnight. We’ll be discussing search optimization in the next session.",
      read: true,
    },
    {
      id: 3,
      title: "PLC Lab Preparation",
      day: "Thursday",
      time: "9:00 AM",
      from: "Eddie Jones",
      message:
        "Bring your lab kits and ensure the ladder logic simulation is working. We’ll run through automated control tests tomorrow.",
      read: true,
    },
    {
      id: 4,
      title: "Software Engineering Projects Review",
      day: "Friday",
      time: "11:15 AM",
      from: "Sarah Connoly",
      message:
        "Project progress reviews start next week. Each team should submit a short summary and demo video link before Monday.",
      read: true,
    },
    {
      id: 5,
      title: "Concurrency Q&A Session",
      day: "Monday",
      time: "4:00 PM",
      from: "Sion Hannuna",
      message:
        "I’ll be holding an open Q&A session for concurrency coursework — bring any questions on race conditions or async design.",
      read: true,
    },
    {
      id: 6,
      title: "Data Structures Revision",
      day: "Saturday",
      time: "1:30 PM",
      from: "Majid Mirmehdi",
      message:
        "Extra revision material on heaps and sorting algorithms has been uploaded to Moodle — please review before the next test.",
      read: true,
    },
    {
      id: 7,
      title: "PLC Group Work Reminder",
      day: "Wednesday",
      time: "8:45 AM",
      from: "Eddie Jones",
      message:
        "Each group should finalize schematic diagrams before Friday’s lab test. We’ll verify I/O configurations first.",
      read: true,
    },
    {
      id: 8,
      title: "Final Report Guidelines",
      day: "Sunday",
      time: "3:30 PM",
      from: "Sarah Connoly",
      message:
        "Final project report templates for Software Engineering have been shared — use the formatting provided for consistency.",
      read: true,
    },
  ];

  const notifications = apiCall.map((notification) => (
    <NotificationMessage key={notification.id} props={notification} />
  ));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="mx-2 hover:cursor-pointer p-2 hover:bg-accent hover:ease-in-out">
          <Bell size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mx-5 h-64 w-96 lg:h-128 lg:w-128 flex flex-col p-1">
          {/* <DropdownMenuItem className="w-128 flex flex-col p-1"> */}
          {notifications}
          {/* </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
