import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  RefreshCw,
  BarChart2,
  PieChart as PieIcon,
  WifiOff
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useOnlineStatus } from '../../lib/offlineStorage';

interface GradeBucket {
  grade: string;
  label: string;
  count: number;
  color: string;
}

interface MonthlyAttendance {
  month: string;
  rate: number;
  target: number;
  classAvg: number;
}

interface SubjectScore {
  subject: string;
  avgScore: number;
  passRate: number;
  students: number;
}

interface AtRiskStudent {
  id: string;
  name: string;
  class: string;
  gradeAvg: number;
  attendance: number;
  status: 'At Risk' | 'Needs Attention' | 'Excellence';
}

export const PerformanceOverview: React.FC = () => {
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');

  // Chart SVG Refs
  const gradeChartRef = useRef<SVGSVGElement | null>(null);
  const attendanceChartRef = useRef<SVGSVGElement | null>(null);
  const subjectChartRef = useRef<SVGSVGElement | null>(null);
  const donutChartRef = useRef<SVGSVGElement | null>(null);

  // Tooltip State
  const [activeTooltip, setActiveTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    details: string[];
  }>({ visible: false, x: 0, y: 0, title: '', details: [] });

  // Mock Data sets responsive to class filter
  const getGradeData = (): GradeBucket[] => {
    const multiplier = selectedClass === 'Class 10-A' ? 0.8 : selectedClass === 'Class 12-A' ? 1.2 : 1;
    return [
      { grade: 'A+', label: '90-100%', count: Math.round(42 * multiplier), color: '#10b981' },
      { grade: 'A', label: '80-89%', count: Math.round(68 * multiplier), color: '#3b82f6' },
      { grade: 'B', label: '70-79%', count: Math.round(55 * multiplier), color: '#6366f1' },
      { grade: 'C', label: '60-69%', count: Math.round(28 * multiplier), color: '#f59e0b' },
      { grade: 'D', label: '50-59%', count: Math.round(14 * multiplier), color: '#f97316' },
      { grade: 'F', label: '<50%', count: Math.round(6 * multiplier), color: '#ef4444' },
    ];
  };

  const getAttendanceData = (): MonthlyAttendance[] => {
    const base = selectedClass === 'Class 10-A' ? 2 : selectedClass === 'Class 11-A' ? -3 : 0;
    return [
      { month: 'Sep', rate: Math.min(99, 94 + base), target: 92, classAvg: 91 },
      { month: 'Oct', rate: Math.min(99, 92 + base), target: 92, classAvg: 89 },
      { month: 'Nov', rate: Math.min(99, 89 + base), target: 92, classAvg: 88 },
      { month: 'Dec', rate: Math.min(99, 86 + base), target: 92, classAvg: 85 },
      { month: 'Jan', rate: Math.min(99, 91 + base), target: 92, classAvg: 90 },
      { month: 'Feb', rate: Math.min(99, 95 + base), target: 92, classAvg: 92 },
      { month: 'Mar', rate: Math.min(99, 96 + base), target: 92, classAvg: 93 },
      { month: 'Apr', rate: Math.min(99, 93 + base), target: 92, classAvg: 91 },
      { month: 'May', rate: Math.min(99, 97 + base), target: 92, classAvg: 94 },
    ];
  };

  const getSubjectData = (): SubjectScore[] => {
    return [
      { subject: 'Mathematics', avgScore: 82, passRate: 94, students: 140 },
      { subject: 'Physics', avgScore: 78, passRate: 88, students: 125 },
      { subject: 'Chemistry', avgScore: 75, passRate: 85, students: 120 },
      { subject: 'Computer Sci.', avgScore: 89, passRate: 98, students: 135 },
      { subject: 'English Lit.', avgScore: 86, passRate: 96, students: 145 },
      { subject: 'Biology', avgScore: 81, passRate: 92, students: 110 },
    ];
  };

  const atRiskStudents: AtRiskStudent[] = [
    { id: 'STU-104', name: 'Marcus Vance', class: 'Class 10-A', gradeAvg: 52, attendance: 74, status: 'At Risk' },
    { id: 'STU-112', name: 'Sophia Chen', class: 'Class 10-B', gradeAvg: 61, attendance: 81, status: 'Needs Attention' },
    { id: 'STU-205', name: 'Liam Gallagher', class: 'Class 11-A', gradeAvg: 48, attendance: 68, status: 'At Risk' },
    { id: 'STU-309', name: 'Aaliyah Patel', class: 'Class 12-A', gradeAvg: 96, attendance: 98, status: 'Excellence' },
    { id: 'STU-315', name: 'David Kim', class: 'Class 12-B', gradeAvg: 94, attendance: 99, status: 'Excellence' },
  ];

  // ==========================================
  // D3 DRAWING 1: GRADE DISTRIBUTION BAR CHART
  // ==========================================
  useEffect(() => {
    if (!gradeChartRef.current) return;

    const svg = d3.select(gradeChartRef.current);
    svg.selectAll('*').remove();

    const data = getGradeData();
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 450 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 450 240`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(0.3)
      .domain(data.map((d) => d.grade));

    const y = d3
      .scaleLinear()
      .rangeRound([height, 0])
      .domain([0, d3.max(data, (d) => d.count) || 100]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3 3');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-weight', 'bold')
      .attr('fill', '#64748b');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.grade) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 6)
      .attr('fill', (d) => d.color)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        const [rectX, rectY] = d3.pointer(event, gradeChartRef.current);
        setActiveTooltip({
          visible: true,
          x: rectX,
          y: rectY - 10,
          title: `Grade ${d.grade} (${d.label})`,
          details: [`Total Students: ${d.count}`, `Share: ${Math.round((d.count / d3.sum(data, (s) => s.count)) * 100)}%`],
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setActiveTooltip((prev) => ({ ...prev, visible: false }));
      })
      .transition()
      .duration(750)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => height - y(d.count));

    // Value Labels on Top of Bars
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => (x(d.grade) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#334155')
      .text((d) => d.count);
  }, [selectedClass, selectedSubject, selectedTerm]);

  // ===============================================
  // D3 DRAWING 2: ATTENDANCE TRENDS LINE/AREA CHART
  // ===============================================
  useEffect(() => {
    if (!attendanceChartRef.current) return;

    const svg = d3.select(attendanceChartRef.current);
    svg.selectAll('*').remove();

    const data = getAttendanceData();
    const margin = { top: 25, right: 25, bottom: 40, left: 45 };
    const width = 550 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 550 240`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint()
      .range([0, width])
      .padding(0.2)
      .domain(data.map((d) => d.month));

    const y = d3.scaleLinear().domain([75, 100]).range([height, 0]);

    // Gradient definition for area under line
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'attendance-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.35);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.0);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-weight', 'bold')
      .attr('fill', '#64748b');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll('text')
      .attr('fill', '#64748b');

    // Target Benchmark Line (92%)
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(92))
      .attr('y2', y(92))
      .attr('stroke', '#f59e0b')
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-width', 1.5);

    g.append('text')
      .attr('x', width - 5)
      .attr('y', y(92) - 6)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#d97706')
      .text('Target 92%');

    // Area path
    const area = d3
      .area<MonthlyAttendance>()
      .x((d) => x(d.month) || 0)
      .y0(height)
      .y1((d) => y(d.rate))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#attendance-gradient)')
      .attr('d', area);

    // Line path
    const line = d3
      .line<MonthlyAttendance>()
      .x((d) => x(d.month) || 0)
      .y((d) => y(d.rate))
      .curve(d3.curveMonotoneX);

    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Animated path drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0);

    // Data Circles / Dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.month) || 0)
      .attr('cy', (d) => y(d.rate))
      .attr('r', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2.5)
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('r', 7).attr('fill', '#2563eb');
        const [ptX, ptY] = d3.pointer(event, attendanceChartRef.current);
        setActiveTooltip({
          visible: true,
          x: ptX,
          y: ptY - 10,
          title: `Month: ${d.month}`,
          details: [
            `Attendance Rate: ${d.rate}%`,
            `School Benchmark: ${d.target}%`,
            `Status: ${d.rate >= d.target ? 'Above Benchmark' : 'Below Benchmark'}`
          ]
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('r', 5).attr('fill', '#ffffff');
        setActiveTooltip((prev) => ({ ...prev, visible: false }));
      });
  }, [selectedClass, selectedSubject, selectedTerm]);

  // =======================================================
  // D3 DRAWING 3: SUBJECT SCORE HORIZONTAL BAR CHART
  // =======================================================
  useEffect(() => {
    if (!subjectChartRef.current) return;

    const svg = d3.select(subjectChartRef.current);
    svg.selectAll('*').remove();

    const data = getSubjectData();
    const margin = { top: 15, right: 35, bottom: 25, left: 100 };
    const width = 450 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 450 220`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .rangeRound([0, height])
      .padding(0.25)
      .domain(data.map((d) => d.subject));

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

    // Axes
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-weight', 'bold')
      .attr('fill', '#475569');

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d}%`))
      .selectAll('text')
      .attr('fill', '#64748b');

    // Horizontal Bars
    g.selectAll('.subj-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'subj-bar')
      .attr('y', (d) => y(d.subject) || 0)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('rx', 5)
      .attr('fill', (d) => (d.avgScore >= 85 ? '#10b981' : d.avgScore >= 75 ? '#3b82f6' : '#f59e0b'))
      .attr('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        const [barX, barY] = d3.pointer(event, subjectChartRef.current);
        setActiveTooltip({
          visible: true,
          x: barX,
          y: barY - 10,
          title: d.subject,
          details: [`Average Score: ${d.avgScore}%`, `Pass Rate: ${d.passRate}%`, `Enrolled: ${d.students} students`]
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setActiveTooltip((prev) => ({ ...prev, visible: false }));
      })
      .transition()
      .duration(800)
      .attr('width', (d) => x(d.avgScore));

    // Value Labels
    g.selectAll('.subj-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.avgScore) + 6)
      .attr('y', (d) => (y(d.subject) || 0) + y.bandwidth() / 2 + 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text((d) => `${d.avgScore}%`);
  }, [selectedClass, selectedSubject, selectedTerm]);

  // ==========================================
  // D3 DRAWING 4: DONUT PASS/FAIL PIE CHART
  // ==========================================
  useEffect(() => {
    if (!donutChartRef.current) return;

    const svg = d3.select(donutChartRef.current);
    svg.selectAll('*').remove();

    const pieData = [
      { name: 'Exceeding Target', count: 110, color: '#10b981' },
      { name: 'Meeting Target', count: 85, color: '#3b82f6' },
      { name: 'Needs Support', count: 25, color: '#f59e0b' },
      { name: 'Critical Concern', count: 10, color: '#ef4444' },
    ];

    const width = 280;
    const height = 220;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<{ name: string; count: number; color: string }>().value((d) => d.count);

    const arc = d3
      .arc<d3.PieArcDatum<{ name: string; count: number; color: string }>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc').data(pie(pieData)).enter().append('g').attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr(
            'd',
            d3
              .arc<d3.PieArcDatum<{ name: string; count: number; color: string }>>()
              .innerRadius(radius * 0.52)
              .outerRadius(radius + 6)
          );

        const [pX, pY] = d3.pointer(event, donutChartRef.current);
        setActiveTooltip({
          visible: true,
          x: pX,
          y: pY - 10,
          title: d.data.name,
          details: [`Student Count: ${d.data.count}`, `Proportion: ${Math.round((d.data.count / 230) * 100)}%`]
        });
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('d', arc);
        setActiveTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Center Summary Text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', '18px')
      .attr('font-weight', '800')
      .attr('fill', '#0f172a')
      .text('84.7%');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#64748b')
      .text('Overall Pass Rate');
  }, [selectedClass, selectedSubject, selectedTerm]);

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Floating D3 Interactive Tooltip */}
      {activeTooltip.visible && (
        <div
          className="pointer-events-none absolute z-50 bg-slate-900 text-white rounded-xl shadow-2xl p-2.5 text-xs border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y - 45}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="font-bold text-amber-400 border-b border-slate-700 pb-1 mb-1">
            {activeTooltip.title}
          </div>
          {activeTooltip.details.map((detail, idx) => (
            <div key={idx} className="text-slate-200 text-[11px] font-medium">
              {detail}
            </div>
          ))}
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Performance Analytics & Overview
            </h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              D3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time interactive grade distributions, monthly attendance trajectories, and subject mastery benchmarks.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isOnline && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-300">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" /> Offline Mode
            </span>
          )}

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 11-A">Class 11-A</option>
              <option value="Class 12-A">Class 12-A</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          {/* Term Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Term 1">Term 1 (Fall)</option>
              <option value="Term 2">Term 2 (Spring)</option>
              <option value="Annual">Full Academic Year</option>
            </select>
          </div>

          {/* Print/Export */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Average School GPA</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">3.48 <span className="text-xs text-emerald-600 font-bold">/ 4.0</span></div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">+0.14 vs last term</div>
          </div>
          <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Overall Attendance Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">94.2%</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">+2.2% above benchmark</div>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Pass Rate Benchmark</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">84.7%</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">230/270 students passing</div>
          </div>
          <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Students At Risk</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">12 <span className="text-xs text-rose-500 font-bold">Students</span></div>
            <div className="text-[10px] text-rose-500 font-semibold mt-0.5">&lt;75% attendance or GPA &lt;2.0</div>
          </div>
          <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: GRADE DISTRIBUTION HISTOGRAM */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Grade Distribution Histogram
              </h3>
              <p className="text-[11px] text-slate-500">Number of students categorized by letter grade brackets</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              D3.js Bar Scale
            </span>
          </div>

          <div className="w-full h-60 relative flex items-center justify-center">
            <svg ref={gradeChartRef} className="w-full h-full overflow-visible" />
          </div>
        </div>

        {/* CHART 2: MONTHLY ATTENDANCE TRAJECTORY */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Attendance Trajectory
              </h3>
              <p className="text-[11px] text-slate-500">Monthly attendance % vs 92% school benchmark line</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              D3.js Curve Interpolation
            </span>
          </div>

          <div className="w-full h-60 relative flex items-center justify-center">
            <svg ref={attendanceChartRef} className="w-full h-full overflow-visible" />
          </div>
        </div>
      </div>

      {/* Lower Row Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 3: SUBJECT AVERAGE SCORES */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Subject Mastery Comparison
              </h3>
              <p className="text-[11px] text-slate-500">Mean academic score % across key departments</p>
            </div>
          </div>

          <div className="w-full h-56 relative flex items-center justify-center">
            <svg ref={subjectChartRef} className="w-full h-full overflow-visible" />
          </div>
        </div>

        {/* CHART 4: PERFORMANCE STATUS DONUT */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" /> Student Mastery Segments
              </h3>
              <p className="text-[11px] text-slate-500">Proportional division of current student outcomes</p>
            </div>
          </div>

          <div className="w-full h-56 relative flex items-center justify-center">
            <svg ref={donutChartRef} className="w-full h-full overflow-visible" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Exceeding (48%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Meeting (37%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Support Needed (11%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-600 font-semibold">Critical Concern (4%)</span>
            </div>
          </div>
        </div>

        {/* AT RISK & HIGH PERFORMERS TABLE */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Student Focus List
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live Watchlist</span>
            </div>

            <div className="space-y-2">
              {atRiskStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[10px] text-slate-400">{st.class} • ID: {st.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{st.gradeAvg}% Avg</div>
                    <span
                      className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                        st.status === 'At Risk'
                          ? 'bg-rose-100 text-rose-700'
                          : st.status === 'Needs Attention'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100 text-xs text-blue-900 space-y-1 mt-3">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Automated AI Advisory Insight
            </div>
            <p className="text-[11px] text-blue-800 leading-snug">
              Class 10-A showed a <strong>+4.2% attendance recovery</strong> after the parent-teacher review in October. Consider holding targeted math tutorials for Marcus Vance and Liam Gallagher.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
