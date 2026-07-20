function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function requireGithubWriteAccess(
  repository: unknown,
  repositoryName: string,
): void {
  const permissions = isRecord(repository) ? repository.permissions : undefined;
  const canPush = isRecord(permissions) && permissions.push === true;

  if (!canPush) {
    throw new Error(
      `GitHub user does not have write access to ${repositoryName}.`,
    );
  }
}
