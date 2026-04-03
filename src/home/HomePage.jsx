import { Button, Card, CardBody } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/CORPSEED.webp";
import { ThemeSwitch } from "../components/theme-switch";
import { BarChart3, Users, FileText, Briefcase } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-black">
      {/* HEADER */}
      <header className="dark:bg-black dark:text-white bg-white h-[60px] shadow px-6 flex items-center justify-between sticky top-0 z-50">
        <img src={logo} alt="corpseed" className="h-[42px]" />

        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <Button color="primary" onPress={() => navigate("/login")}>
            Login
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        className="flex flex-col items-center justify-center text-center py-20 px-4 
bg-gradient-to-b from-transparent via-white/40 to-transparent 
dark:via-white/5 backdrop-blur-sm"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white">
          ERP for Liaisoning & Compliance Services
        </h1>

        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Manage leads from Corpseed, convert them into proposals, track
          operations, and handle billing — all in one unified platform.
        </p>

        <div className="mt-6 flex gap-4">
          <Button color="primary" size="lg" onPress={() => navigate("/login")}>
            Get Started
          </Button>

          <Button variant="bordered" size="lg">
            Explore Features
          </Button>
        </div>
      </section>

      {/* KPI CARDS */}
      {/* GRADIENT SHOWCASE SECTION */}
      <section className="px-6 md:px-16 mb-20">
        <div className="rounded-3xl p-10 md:p-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
          {/* Glow Effects */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            {/* LEFT CONTENT */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Manage Leads, Operations & Billing Seamlessly
              </h2>

              <p className="mt-4 text-white/90 text-lg">
                From capturing leads to executing compliance services and
                generating invoices — everything is streamlined in one powerful
                ERP system.
              </p>

              <div className="mt-6 flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black font-semibold"
                  onPress={() => navigate("/login")}
                >
                  Start Managing
                </Button>

                <Button
                  size="lg"
                  variant="bordered"
                  className="border-white text-white"
                >
                  View Modules
                </Button>
              </div>
            </div>

            {/* RIGHT VISUAL (GLASS CARDS) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20">
                <p className="text-sm">Lead Flow</p>
                <h3 className="text-xl font-bold mt-1">Auto Capture</h3>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20">
                <p className="text-sm">Proposal</p>
                <h3 className="text-xl font-bold mt-1">Quick Generate</h3>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20">
                <p className="text-sm">Operations</p>
                <h3 className="text-xl font-bold mt-1">Track Easily</h3>
              </div>

              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20">
                <p className="text-sm">Accounts</p>
                <h3 className="text-xl font-bold mt-1">Invoice Ready</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 md:px-16 mb-20">
        <h2 className="text-3xl font-bold text-center mb-10 text-neutral-800 dark:text-white">
          Core Modules
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Lead Management</h3>
              <p className="text-sm text-gray-500 mt-2">
                Capture leads from website & social media, assign and track
                efficiently.
              </p>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Proposal & Estimates</h3>
              <p className="text-sm text-gray-500 mt-2">
                Create proposals, convert to PI, manage pricing and documents.
              </p>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Operations Tracking</h3>
              <p className="text-sm text-gray-500 mt-2">
                Track project lifecycle, documents, and compliance progress.
              </p>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Accounts & Billing</h3>
              <p className="text-sm text-gray-500 mt-2">
                Manage invoices, payments, and financial workflows.
              </p>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Document Management</h3>
              <p className="text-sm text-gray-500 mt-2">
                Upload, verify, and manage compliance documents.
              </p>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-white/70 to-white/40 
dark:from-white/5 dark:to-white/10 
backdrop-blur-xl border border-white/20 
shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <CardBody>
              <h3 className="font-semibold text-lg">Analytics & Reports</h3>
              <p className="text-sm text-gray-500 mt-2">
                Get insights on leads, revenue, and performance.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-primary text-white text-center py-12">
        <h2 className="text-2xl font-bold">
          Ready to manage your entire workflow in one place?
        </h2>

        <Button
          className="mt-4 text-white font-semibold"
          size="lg"
          variant="flat"
          onPress={() => navigate("/login")}
        >
          Login to ERP
        </Button>
      </section>
    </div>
  );
};

export default HomePage;
