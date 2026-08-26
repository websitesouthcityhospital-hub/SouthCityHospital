import type { Doctor, DoctorFilterParams } from "@sch/types";

const MOCK_DOCTORS: Doctor[] = [];

export async function getMockDoctors(params: DoctorFilterParams): Promise<Doctor[]> {
  let result = [...MOCK_DOCTORS];

  if (params.activeOnly) {
    result = result.filter((d) => d.active);
  }

  if (params.departmentSlug && params.departmentSlug !== "all") {
    result = result.filter((d) => d.departmentSlug === params.departmentSlug);
  }

  return result;
}
