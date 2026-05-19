import { useI18n } from '../lib/i18n';
import PetitionForm from '../components/PetitionForm';

export default function Petition() {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container narrow">
        <span className="kicker">{t('nav.petition')}</span>
        <h1>{t('petition.title')}</h1>
        <p className="lead">{t('petition.lead')}</p>
        <PetitionForm />
      </div>
    </section>
  );
}
