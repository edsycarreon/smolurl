import { LinkDTO } from 'src/dto';

export const castLinkDto = (data: any): LinkDTO => ({
  linkId: data.link_id,
  shortUrl: data.short_url,
  originalUrl: data.original_url,
  visitCount: data.visit_count,
  expiresIn: data.expires_in,
  lastRedirect: data.last_redirect,
});
