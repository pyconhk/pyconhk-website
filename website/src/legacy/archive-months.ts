export interface ArchiveMonthLink {
  path: string;
  label: string;
  year: string;
  month: string;
}

export const archiveMonths = [
  { path: '2024/11', label: 'November 2024', year: '2024', month: '11' },
  { path: '2024/10', label: 'October 2024', year: '2024', month: '10' },
  { path: '2024/09', label: 'September 2024', year: '2024', month: '09' },
  { path: '2024/07', label: 'July 2024', year: '2024', month: '07' },
  { path: '2024/04', label: 'April 2024', year: '2024', month: '04' },
  { path: '2023/12', label: 'December 2023', year: '2023', month: '12' },
  { path: '2023/10', label: 'October 2023', year: '2023', month: '10' },
  { path: '2023/09', label: 'September 2023', year: '2023', month: '09' },
  { path: '2023/07', label: 'July 2023', year: '2023', month: '07' },
  { path: '2023/04', label: 'April 2023', year: '2023', month: '04' },
  { path: '2022/11', label: 'November 2022', year: '2022', month: '11' },
  { path: '2022/10', label: 'October 2022', year: '2022', month: '10' },
  { path: '2022/08', label: 'August 2022', year: '2022', month: '08' },
  { path: '2021/10', label: 'October 2021', year: '2021', month: '10' },
  { path: '2021/09', label: 'September 2021', year: '2021', month: '09' },
  { path: '2021/05', label: 'May 2021', year: '2021', month: '05' },
  { path: '2020/11', label: 'November 2020', year: '2020', month: '11' },
  { path: '2020/10', label: 'October 2020', year: '2020', month: '10' },
  { path: '2020/09', label: 'September 2020', year: '2020', month: '09' },
  { path: '2020/05', label: 'May 2020', year: '2020', month: '05' },
  { path: '2020/04', label: 'April 2020', year: '2020', month: '04' },
  { path: '2018/11', label: 'November 2018', year: '2018', month: '11' },
  { path: '2018/10', label: 'October 2018', year: '2018', month: '10' },
  { path: '2018/09', label: 'September 2018', year: '2018', month: '09' },
  { path: '2018/08', label: 'August 2018', year: '2018', month: '08' },
  { path: '2017/11', label: 'November 2017', year: '2017', month: '11' },
  { path: '2016/10', label: 'October 2016', year: '2016', month: '10' },
  { path: '2015/11', label: 'November 2015', year: '2015', month: '11' },
] satisfies ArchiveMonthLink[];

export function archiveMonthsForYear(year: string) {
  return archiveMonths.filter((archiveMonth) => archiveMonth.year === year);
}
