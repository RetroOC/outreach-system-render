import type { Campaign } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresCampaignRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Campaign, "id" | "scheduleVersion">): Promise<Campaign> {
    const campaign: Campaign = { id: makeId("cmp"), scheduleVersion: 1, ...input };

    await this.db.query({
      text: `
        insert into campaigns (id, account_id, name, status, objective, settings, schedule_version)
        values ($1,$2,$3,$4,$5,$6::jsonb,$7)
      `,
      values: [
        campaign.id,
        campaign.accountId,
        campaign.name,
        campaign.status,
        campaign.objective ?? null,
        JSON.stringify(campaign.settings),
        campaign.scheduleVersion,
      ],
    });

    for (const step of campaign.steps) {
      await this.db.query({
        text: `
          insert into campaign_steps (
            id, campaign_id, step_number, type, delay_kind, delay_amount, delay_unit, subject_template, body_template
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `,
        values: [
          makeId("cst"),
          campaign.id,
          step.stepNumber,
          step.type,
          step.delay.kind,
          step.delay.amount,
          step.delay.unit,
          step.subjectTemplate,
          step.bodyTemplate,
        ],
      });
    }

    return campaign;
  }
}
