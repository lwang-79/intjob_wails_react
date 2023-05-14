export type ShowStatus = {
  dashboard: boolean;
  jobsPanel: boolean;
  report: boolean;
}

export const PAGES = {
  Dashboard: 'dashboard',
  JobsPanel: 'jobsPanel',
  Report: 'report',
}

export const DEFAULT_SHOW_STATUS: ShowStatus = {
  dashboard: true,
  jobsPanel: false,
  report: false
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