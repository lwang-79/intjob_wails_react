export type ShowStatus = {
  dashboard: boolean;
  jobsPanel: boolean;
  report: boolean;
  database: boolean;
  settings: boolean;
  help: boolean;
}

export const PAGES = {
  Dashboard: 'dashboard',
  JobsPanel: 'jobsPanel',
  Report: 'report',
  Database: 'database',
  Settings: 'settings',
  Help: 'help',
}

export const DEFAULT_SHOW_STATUS: ShowStatus = {
  dashboard: true,
  jobsPanel: false,
  report: false,
  database: false,
  settings: false,
  help: false,
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