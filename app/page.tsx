"use client";

import { useState, useMemo, useEffect } from "react";
import { Thing, ThingStatus } from "@/lib/types";
import ThingsGrid from "./components/ThingsGrid";

export default function Home() {
  const [selectedStatus, setSelectedStatus] = useState<ThingStatus | "all">("all");
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/things")
      .then((res) => res.json())
      .then((data) => {
        setThings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching things:", err);
        setLoading(false);
      });
  }, []);

  const filteredThings = useMemo(() => {
    if (selectedStatus === "all") {
      return things;
    }
    return things.filter((thing) => thing.status === selectedStatus);
  }, [selectedStatus, things]);

  const handleStatusClick = (status: ThingStatus) => {
    setSelectedStatus(status === selectedStatus ? "all" : status);
  };

  const handleThingsClick = () => {
    setSelectedStatus("all");
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1440px] mx-auto px-7 sm:px-7 pt-[34px] pb-16">
        <h1 className="text-[40px] sm:text-[40px] font-medium leading-normal text-black tracking-[-2px] mb-[38px]">
          <button
            onClick={handleThingsClick}
            className={`underline decoration-solid underline-offset-4 ${
              selectedStatus === "all"
                ? "text-black"
                : "text-black/30 hover:text-black"
            } transition-colors focus:outline-none`}
            aria-pressed={selectedStatus === "all"}
            aria-label="Show all things"
          >
            Things
          </button>{" "}
          <span className="text-black/30">I</span>{" "}
          <button
            onClick={() => handleStatusClick("like")}
            className={`underline decoration-solid underline-offset-4 ${
              selectedStatus === "like"
                ? "text-black"
                : "text-black/30 hover:text-black"
            } transition-colors focus:outline-none`}
            aria-pressed={selectedStatus === "like"}
            aria-label="Filter by like"
          >
            like
          </button>
          {", "}
          <button
            onClick={() => handleStatusClick("have")}
            className={`underline decoration-solid underline-offset-4 ${
              selectedStatus === "have"
                ? "text-black"
                : "text-black/30 hover:text-black"
            } transition-colors focus:outline-none`}
            aria-pressed={selectedStatus === "have"}
            aria-label="Filter by have"
          >
            have
          </button>
          {", "}
          <button
            onClick={() => handleStatusClick("want")}
            className={`underline decoration-solid underline-offset-4 ${
              selectedStatus === "want"
                ? "text-black"
                : "text-black/30 hover:text-black"
            } transition-colors focus:outline-none`}
            aria-pressed={selectedStatus === "want"}
            aria-label="Filter by want"
          >
            want
          </button>
        </h1>

        {loading ? (
          <div className="text-center py-12 text-black/60">Loading...</div>
        ) : (
          <ThingsGrid things={filteredThings} />
        )}
      </main>
    </div>
  );
}
