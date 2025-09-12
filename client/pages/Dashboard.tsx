import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CheckCircle2, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard">
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">1,284</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 text-primary" />
            +3.2% this week
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-3xl">32</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="size-4 text-primary" />
            +5 this month
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-3xl">764</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            92% on-time
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                {
                  title: "New user invited",
                  detail: "sarah@company.com",
                  time: "2h ago",
                },
                {
                  title: "Project archived",
                  detail: "Mobile Redesign",
                  time: "5h ago",
                },
                {
                  title: "Task completed",
                  detail: "Q3 planning deck",
                  time: "1d ago",
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button className="justify-start" variant="secondary">
              <Plus className="mr-2" /> Create project
            </Button>
            <Button className="justify-start" variant="secondary">
              <Plus className="mr-2" /> Invite user
            </Button>
            <Button className="justify-start" variant="secondary">
              <Plus className="mr-2" /> Add task
            </Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
