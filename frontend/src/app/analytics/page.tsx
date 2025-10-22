import {DropdownCard} from "@/components/dropdown-card";
import {Avatar} from "@/components/ui/avatar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import GradientGraph from "@/components/gradient-graph";
import {ToggleGroup} from "@/components/ui/toggle-group";
import {AnalyticsToolbar} from "@/components/analytics/analytics-toolbar";
import {StudentDetailCard} from "@/components/analytics/student-details-card";

export default async function UnitPage() {
    type StudentData = {
        name: string;
        uuid: number;
        score: number;
    };

    const studentData: StudentData[] = Array.from({length: 150}, (_, i) => ({
        name: `${i + 1} Student`,
        uuid: i + 1,
        score: Math.floor(Math.random() * 101),
    }));

    return (
        <div className="space-y-6">
            <AnalyticsToolbar />
            <div className="flex flex-col lg:flex-row gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>
                            <div className="text-2xl">Student Graph</div>
                            <div className="font-light">
                                Visualisation of scores across all students.
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GradientGraph
                            className="bg-accent"
                            studentData={studentData}
                        ></GradientGraph>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>
                            <div className="text-2xl">Top Students</div>
                            <div className="font-light">
                                Highest performing students so far.
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Card className="bg-accent flex-1"></Card>
                        <Card className="bg-accent flex-1"></Card>
                        <Card className="bg-accent flex-1"></Card>
                        <Card className="bg-accent flex-1"></Card>
                        <Card className="bg-accent flex-1"></Card>
                    </CardContent>
                </Card>
            </div>
            <StudentDetailCard />
        </div>
    );
}
