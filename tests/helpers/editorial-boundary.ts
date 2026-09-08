export function validateEditorialBoundary(environment, files) {
  const { CMS_PR_HEAD, CMS_PR_HEAD_REPO, CMS_PR_BASE_REPO } = environment;
  if (!CMS_PR_HEAD?.startsWith("cms/") || !CMS_PR_BASE_REPO || CMS_PR_HEAD_REPO !== CMS_PR_BASE_REPO) {
    throw new Error("Only same-repository Decap editorial branches may target cms.");
  }
  if (!files.length || files.some((file) => !/^(website\/outstatic\/(content|media)\/|website\/public\/outstatic\/images\/)/.test(file))) {
    throw new Error("CMS editorial PRs must change only owned content and media paths.");
  }
}
