type notificationData = {
    key: number;
    title: string;
    day: string;
    time: string;
    from: string;
    message: string;
}

export default function NotificationMessage({ props }: { props: notificationData }) {
    return (
        <div className="flex flex-col p-2 m-2 border border-slate-300 hover:bg-slate-200 hover:cursor-pointer">
            <div className="flex flex-row justify-between align-bottom items-center">
                <p className="text-lg">{props.title}</p>
                {/* Add date and time logic */}
                <p className="">4 hours ago</p>
            </div>
            <div>
                <p className="flex flex-row gap-x-1">From
                    <span className="underline">{props.from}</span>
                </p>
                <p className="pt-2">{props.message}</p>
            </div>
        </div >
    )
}