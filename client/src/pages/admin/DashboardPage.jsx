import { useEffect, useState } from 'react';
import { HiOutlineClock, HiOutlineUsers, HiOutlineUserGroup, HiOutlineXCircle } from 'react-icons/hi2';
import StatCard from '../../components/dashboard/StatCard';
import SkeletonCard from '../../components/dashboard/SkeletonCard';
import AttendanceTrendChart from '../../components/dashboard/AttendanceTrendChart';
import MonthlySummaryChart from '../../components/dashboard/MonthlySummaryChart';
import DepartmentChart from '../../components/dashboard/DepartmentChart';
import { adminApi } from '../../services/api';
import {
  mockAttendanceTrends,
  mockDepartmentBreakdown,
  mockMonthlyAttendance,
  mockSummary,
} from '../../data/mockData';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(mockSummary);
  const [trendData, setTrendData] = useState(mockAttendanceTrends);
  const [monthlyData, setMonthlyData] = useState(mockMonthlyAttendance);
  const [departmentData, setDepartmentData] = useState(mockDepartmentBreakdown);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [summaryResponse, trendsResponse] = await Promise.allSettled([
          adminApi.getSummary(),
          adminApi.getAttendanceTrends(30),
        ]);

        if (!mounted) return;

        if (summaryResponse.status === 'fulfilled' && summaryResponse.value.data?.success) {
          const summaryData = summaryResponse.value.data.data;
          setSummary({
            totalEmployees: summaryData?.totalEmployees ?? mockSummary.totalEmployees,
            presentToday: summaryData?.presentToday ?? mockSummary.presentToday,
            lateEmployees: summaryData?.lateToday ?? mockSummary.lateEmployees,
            absentEmployees: summaryData?.absentToday ?? mockSummary.absentEmployees,
          });
        }

        if (trendsResponse.status === 'fulfilled' && trendsResponse.value.data?.success) {
          const trendPayload = trendsResponse.value.data.data;
          setTrendData(trendPayload?.dailyTrends || mockAttendanceTrends);
          setMonthlyData(trendPayload?.monthlySummary || mockMonthlyAttendance);
          setDepartmentData(trendPayload?.departmentData || mockDepartmentBreakdown);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const stats = [
    {
      title: 'Total Employees',
      value: summary.totalEmployees,
      icon: HiOutlineUsers,
      color: 'teal',
      trend: 8,
      trendLabel: 'Compared with last month',
    },
    {
      title: 'Present Today',
      value: summary.presentToday,
      icon: HiOutlineClock,
      color: 'emerald',
      trend: 4,
      trendLabel: 'Check-ins captured live',
    },
    {
      title: 'Late Employees',
      value: summary.lateEmployees,
      icon: HiOutlineUserGroup,
      color: 'orange',
      trend: -2,
      trendLabel: 'Compared with yesterday',
    },
    {
      title: 'Absent Employees',
      value: summary.absentEmployees,
      icon: HiOutlineXCircle,
      color: 'red',
      trend: -1,
      trendLabel: 'Auto-calculated from shifts',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(loading ? Array.from({ length: 4 }) : stats).map((item, index) =>
          loading ? (
            <SkeletonCard key={index} />
          ) : (
            <StatCard key={item.title} {...item} />
          )
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <AttendanceTrendChart data={trendData} loading={loading} />
        <div className="space-y-6">
          <MonthlySummaryChart data={monthlyData} />
          <DepartmentChart data={departmentData} />
        </div>
      </section>
    </div>
  );
}