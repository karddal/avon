type notificationData = {
    title: string;
    day: string;
    time: string;
    from: string;
    message: string;
}

export default function NotificationMessage(props: { props: notificationData }) {
    return (
        <div className="flex flex-col p-2">
            <div className="flex flex-row justify-between gap-10 align-bottom items-center">
                <p className="text-lg">Surprise Algos Coursework!</p>
                {/* Add date and time logic */}
                <p className="">4 hours ago</p>
            </div>
            <div>
                <p className="flex flex-row gap-x-1">From
                    <span className="underline">Christian Konrad</span>
                </p>
                <p className="pt-2">Hello Everyone, We wanted to Surprise you this year by giving you an algos Coursework. Please finish by next week</p>
            </div>
        </div >
    )
}