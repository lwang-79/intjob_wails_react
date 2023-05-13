export type ShowStatus = {
  dashboard: boolean;
  jobsPanel: boolean;
}

export const PAGES = {
  Dashboard: 'dashboard',
  JobsPanel: 'jobsPanel',
}

export const DEFAULT_SHOW_STATUS: ShowStatus = {
  dashboard: true,
  jobsPanel: false,
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