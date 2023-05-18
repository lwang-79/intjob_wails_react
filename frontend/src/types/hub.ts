export type ShowStatus = {
  dashboard: boolean;
  jobsPanel: boolean;
  report: boolean;
  database: boolean;
}

export const PAGES = {
  Dashboard: 'dashboard',
  JobsPanel: 'jobsPanel',
  Report: 'report',
  Database: 'database',
}

export const DEFAULT_SHOW_STATUS: ShowStatus = {
  dashboard: true,
  jobsPanel: false,
  report: false,
  database: false,
}

export const changeStatus = (
  currentStatus: ShowStatus,
  page: typeof PAGES[keyof typeof PAGES]
): ShowStatus => {
  let newStatus = Object.fromEntries(
    Object.keys(currentStatus).map(key => [key, false])
  ) as ShowStatus;

  return {
    ...newStatus,
    [page]: true,
  }
}