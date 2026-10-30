import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Download, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormField } from './components/FormField';
import { ErrorSummary } from './components/ErrorSummary';
import { CollapsibleSection } from './components/CollapsibleSection';
import { Tooltip } from './components/Tooltip';
import { generateFichePDF, type FicheData } from './services/pdfService';

interface ValidationError {
  id: string;
  message: string;
  label: string;
}

const REDIRECT_URL = 'https://1001parcours.cci.fr/experience/mod/page/view.php?id=2133';
const STORAGE_KEY = 'fiche_formation_data';

const INITIAL_DATA: FicheData = {
  titre: '',
  publicCible: '',
  objectifFormation: '',
  objectifsPedagogiques: ['', ''],
  duree: '',
  savoirs: '',
  savoirFaire: '',
  savoirEtre: '',
  modalites: '',
};

export default function App() {
  const [formData, setFormData] = useState<FicheData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return INITIAL_DATA;
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la fiche ? Toutes les données saisies seront perdues.')) {
      setFormData(INITIAL_DATA);
      setErrors([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const updateField = (field: keyof FicheData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors.some(e => e.id === field)) {
      setErrors(prev => prev.filter(e => e.id !== field));
    }
  };

  const updatePedagogicalObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectifsPedagogiques];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectifsPedagogiques: newObjectives }));
    
    if (errors.some(e => e.id === `obj-${index}`)) {
      setErrors(prev => prev.filter(e => e.id !== `obj-${index}`));
    }
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectifsPedagogiques: [...prev.objectifsPedagogiques, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.objectifsPedagogiques.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      objectifsPedagogiques: prev.objectifsPedagogiques.filter((_, i) => i !== index)
    }));
  };

  const validate = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    if (!formData.titre.trim()) newErrors.push({ id: 'titre', label: 'Titre', message: 'Ce champ est obligatoire' });
    if (!formData.publicCible.trim()) newErrors.push({ id: 'publicCible', label: 'Public cible', message: 'Ce champ est obligatoire' });
    if (!formData.objectifFormation.trim()) newErrors.push({ id: 'objectifFormation', label: 'Objectif de formation', message: 'Ce champ est obligatoire' });
    
    formData.objectifsPedagogiques.forEach((obj, index) => {
      if (!obj.trim()) {
        newErrors.push({ id: `obj-${index}`, label: `Objectif pédagogique ${index + 1}`, message: 'Ce champ est obligatoire' });
      }
    });

    if (!formData.duree.trim()) newErrors.push({ id: 'duree', label: 'Durée', message: 'Ce champ est obligatoire' });
    if (!formData.savoirs.trim()) newErrors.push({ id: 'savoirs', label: 'Savoirs', message: 'Ce champ est obligatoire' });
    if (!formData.savoirFaire.trim()) newErrors.push({ id: 'savoirFaire', label: 'Savoir-faire', message: 'Ce champ est obligatoire' });
    if (!formData.savoirEtre.trim()) newErrors.push({ id: 'savoirEtre', label: 'Savoir-être', message: 'Ce champ est obligatoire' });
    if (!formData.modalites.trim()) newErrors.push({ id: 'modalites', label: 'Modalités', message: 'Ce champ est obligatoire' });

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    generateFichePDF(formData);
    setIsSubmitted(true);
    
    // Redirect after a short delay to allow the user to see the success state
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-10">
        <nav className="mb-8" aria-label="Navigation secondaire">
          <button 
            type="button"
            className="flex items-center text-slate-600 hover:text-accent font-medium transition-colors group"
            onClick={() => window.location.href = REDIRECT_URL}
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Retour au parcours
          </button>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Fiche Formation Interactive
        </h1>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Consigne</h2>
          <p className="text-slate-600 leading-relaxed">
            À partir de l'analyse de la demande de formation de Résid'Azur, des savoirs, savoir-faire et savoir-être que vous avez identifiés et des objectifs pédagogiques que vous avez formulés, complétez la fiche synthétique ci-dessous.
          </p>
          <p className="text-slate-600 leading-relaxed mt-2">
            Cette fiche constitue un document de référence que vous pourrez transmettre au service RH pour validation.
          </p>
        </div>

        <CollapsibleSection title="Rappel du cas">
          <div className="space-y-4">
            <p>
              Résid'Azur, groupe de résidences hôtelières et de tourisme, constate une hausse significative des réclamations clients liées à la qualité de l'accueil et à la gestion des situations difficiles (clients mécontents, erreurs de réservation, demandes spécifiques non anticipées). Pour améliorer durablement la satisfaction client, la direction des ressources humaines souhaite former l'ensemble du personnel en contact avec la clientèle aux techniques de communication et de gestion des situations délicates.
            </p>
            <p>
              L'entreprise décide de lancer un programme de formation interne, déployé en plusieurs sessions sur le second semestre, piloté par un groupe de formateurs internes issus des équipes d'encadrement. Ces formateurs doivent concevoir, animer et évaluer des séquences de formation courtes, combinant apports pratiques, mises en situation et jeux de rôle. Caractéristiques de Résid'Azur :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Résid'Azur est un groupe français de 180 personnes, âgées de 20 à 57 ans, réparti sur quatre résidences (Nice, Marseille, Montpellier et Perpignan).</li>
              <li>Les employés concernés sont 120 collaborateurs : réceptionnistes et responsables de résidence en contact avec la clientèle.</li>
              <li>Résid'Azur souhaite déployer des sessions de formation en présentiel de deux jours (14 heures) organisées sur chaque site, par groupes de 10 à 12 participants maximum.</li>
              <li>Niveau initial des apprenants : des pratiques très hétérogènes, certains collaborateurs ayant plus de 15 ans d'expérience et d'autres étant en poste depuis moins de 6 mois. Aucune formation formelle à la gestion des conflits n'a été dispensée auparavant.</li>
              <li>Une collaboratrice du site de Marseille est en situation de handicap visuel.</li>
            </ul>
          </div>
        </CollapsibleSection>
      </header>

      <main>
        <ErrorSummary errors={errors} />

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-10" noValidate>
          {/* Section 1-3 */}
          <section className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <FormField
              id="titre"
              label="1. Titre de la formation"
              labelClassName="text-xl font-bold"
              helpText="Formulez un titre clair et explicite qui reflète l'objectif principal de la formation."
              value={formData.titre}
              onChange={(val) => updateField('titre', val)}
              error={errors.find(e => e.id === 'titre')?.message}
            />

            <FormField
              id="publicCible"
              label="2. Public cible"
              labelClassName="text-xl font-bold"
              type="textarea"
              helpText="Décrivez précisément les participants : fonction, niveau d'expérience, effectif, particularités."
              value={formData.publicCible}
              onChange={(val) => updateField('publicCible', val)}
              error={errors.find(e => e.id === 'publicCible')?.message}
            />

            <FormField
              id="objectifFormation"
              label="3. Objectif de formation"
              labelClassName="text-xl font-bold"
              type="textarea"
              helpText="Formulez l'objectif global visé par le commanditaire. Il répond à la question : 'À l'issue de la formation, les participants seront capables de...'"
              value={formData.objectifFormation}
              onChange={(val) => updateField('objectifFormation', val)}
              error={errors.find(e => e.id === 'objectifFormation')?.message}
            />
          </section>

          {/* Section 4: Objectifs Pédagogiques */}
          <section className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="section-objectifs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h2 id="section-objectifs" className="text-xl font-bold text-slate-800">
                  4. Objectifs pédagogiques <span className="text-red-500" aria-hidden="true">*</span>
                </h2>
                <Tooltip 
                  id="help-objectifs" 
                  content="Formulez chaque objectif avec un verbe d'action observable (taxonomie de Bloom) + contenu + conditions."
                />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Min. 2 requis</span>
            </div>

            <div className="space-y-4" aria-live="polite">
              <AnimatePresence initial={false}>
                {formData.objectifsPedagogiques.map((obj, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-grow">
                      <label htmlFor={`field-obj-${index}`} className="sr-only">Objectif pédagogique {index + 1}</label>
                      <input
                        id={`field-obj-${index}`}
                        type="text"
                        value={obj}
                        onChange={(e) => updatePedagogicalObjective(index, e.target.value)}
                        aria-invalid={errors.some(e => e.id === `obj-${index}`)}
                        aria-required="true"
                        className={`w-full px-4 py-3 bg-white border rounded-lg transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none ${
                          errors.some(e => e.id === `obj-${index}`) ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      />
                      {errors.find(e => e.id === `obj-${index}`) && (
                        <p className="text-xs text-red-600 mt-1 font-medium" role="alert">Ce champ est obligatoire</p>
                      )}
                    </div>
                    {formData.objectifsPedagogiques.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Supprimer l'objectif pédagogique ${index + 1}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={addObjective}
              className="flex items-center text-sm font-semibold text-accent hover:text-accent-hover transition-colors px-4 py-2 rounded-lg border border-accent/20 hover:bg-accent/5"
            >
              <Plus size={18} className="mr-2" />
              Ajouter un objectif pédagogique
            </button>
          </section>

          {/* Section 5: Durée */}
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <FormField
              id="duree"
              label="5. Durée"
              labelClassName="text-xl font-bold"
              helpText="Indiquez la durée totale et le découpage éventuel."
              value={formData.duree}
              onChange={(val) => updateField('duree', val)}
              error={errors.find(e => e.id === 'duree')?.message}
            />
          </section>

          {/* Section 6: Programme */}
          <section className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm" aria-labelledby="section-programme">
            <div className="flex items-center border-b border-slate-100 pb-4">
              <h2 id="section-programme" className="text-xl font-bold text-slate-800">
                6. Programme <span className="text-red-500" aria-hidden="true">*</span>
              </h2>
              <Tooltip 
                id="help-programme" 
                content="Savoirs : Connaissances théoriques. Savoir-faire : Compétences pratiques. Savoir-être : Postures professionnelles."
              />
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <FormField
                id="savoirs"
                label="Savoirs (Connaissances)"
                type="textarea"
                helpText=""
                value={formData.savoirs}
                onChange={(val) => updateField('savoirs', val)}
                error={errors.find(e => e.id === 'savoirs')?.message}
              />

              <FormField
                id="savoirFaire"
                label="Savoir-faire (Compétences)"
                type="textarea"
                helpText=""
                value={formData.savoirFaire}
                onChange={(val) => updateField('savoirFaire', val)}
                error={errors.find(e => e.id === 'savoirFaire')?.message}
              />

              <FormField
                id="savoirEtre"
                label="Savoir-être (Postures)"
                type="textarea"
                helpText=""
                value={formData.savoirEtre}
                onChange={(val) => updateField('savoirEtre', val)}
                error={errors.find(e => e.id === 'savoirEtre')?.message}
              />
            </div>
          </section>

          {/* Section 7: Modalités */}
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <FormField
              id="modalites"
              label="7. Modalités"
              labelClassName="text-xl font-bold"
              type="textarea"
              helpText="Précisez le format : présentiel, distanciel, hybride..."
              value={formData.modalites}
              onChange={(val) => updateField('modalites', val)}
              error={errors.find(e => e.id === 'modalites')?.message}
            />
          </section>

          {/* Submit and Reset Buttons */}
          <div className="flex flex-col items-center pt-6 pb-12 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-6 py-4 rounded-xl font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95"
              >
                <RotateCcw className="mr-2" size={20} />
                Réinitialiser la fiche
              </button>

              <button
                type="submit"
                className={`
                  flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95 min-w-[280px]
                  ${isSubmitted 
                    ? 'bg-emerald-500 text-white cursor-default' 
                    : 'bg-accent text-white hover:bg-accent-hover hover:shadow-accent/20 hover:-translate-y-1'
                  }
                `}
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="mr-2" size={24} />
                    Fiche générée avec succès !
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={24} />
                    Valider et télécharger la fiche (PDF)
                  </>
                )}
              </button>
            </div>
            {isSubmitted && (
              <p className="mt-4 text-accent font-medium animate-pulse">
                Redirection vers le parcours dans 2 secondes...
              </p>
            )}
            <p className="mt-4 text-sm text-slate-500 font-medium">
              Tous les champs marqués d'une <span className="text-red-500">*</span> sont obligatoires.
            </p>
          </div>
        </form>
      </main>

      <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 Parcours CCE — Exercer la mission de formateur en entreprise</p>
      </footer>
    </div>
  );
}
