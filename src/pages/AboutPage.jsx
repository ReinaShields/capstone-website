function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 py-12">

      <div className="flex flex-col gap-10">

        {/* About */}
        <section>
          <h2 className="text-xl font-bold mb-3">The Project</h2>
          <p className="text-gray-700 leading-relaxed">
            Alley Archive is a proof-of-concept digital archive developed as part of an academic research project exploring the preservation of street art through technology. The archive was developed alongside a research paper analyzing the history of street art, its temporary nature, and the cultural importance of preservation, with a primary focus on Detroit. :-)
          </p>
        </section>

        {/* Research Paper */}
        <section>
          <h2 className="text-xl font-bold mb-3">Research Paper</h2>
          <p className="text-s text-gray-700 mb-4">"Street Art, Erasure, and Digital Preservation in Detroit"</p>


          <div className="flex flex-col gap-6 text-gray-700 leading-relaxed text-sm">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Introduction</h3>
              <p>
                Street art is among the most publicly visible and least institutionally preserved art forms in contemporary urban culture. Unlike works displayed in galleries or museums, street art exists outside established preservation systems, occupying shared public space and embedding itself directly in the communities surrounding it. These features which define street art as a decentralized, site-specific form of expression make it susceptible to erasure. This paper argues that community-sourced, digital archiving represents a practical response to the erasure of street art in Detroit. It examines street art as a historical and cultural phenomenon, analyzes the political conditions that made Detroit a street art centric city, identifies the forces responsible for its disappearance, evaluates the structural failures of existing digital archives, and presents Alley Archive as a working demonstration of a proposed alternative.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. What Street Art Is and Why It Matters</h3>
              <p>
                Broadly speaking, street art refers to any visual art created in shared public space, commonly unauthorized. This typically includes, but is not limited to, graffiti, murals, wheat paste posters, stickers, and chalk work. Unlike conventional works on canvas or paper, street art often cannot be relocated. As such, the work is inextricable from the structure it occupies and by extension the neighborhood and community surrounding it.
              </p>
              <p className="mt-3">
                Contemporary street art evolved from graffiti writing, which emerged in Philadelphia and New York City in the late 1960s. Darryl McCray, known as CORNBREAD, is widely credited as one of the first graffiti artists, tagging across Philadelphia as early as 1967 (Duncan). In New York, early writers like TAKI 183 popularized tagging as a practice of visibility, writing names across subway cars and buildings to establish presence in public space. As the form developed through the 1970s, tags evolved into more elaborate pieces featuring complex lettering, characters, and color, producing a distinct visual language with its own internal hierarchy of skill and recognition.
              </p>
              <p className="mt-3">
                That visual language spread globally in significant part through graffiti's incorporation as one of the four foundational elements of hip hop culture alongside DJing, MCing, and breakdancing ("The Evolution of Street Art"). As hip hop expanded through music, media, and migration, it carried graffiti with it into cities far removed from its American origins. What started as localized mark making in neglected urban neighborhoods became a recognizable international art form. Over time the form expanded beyond lettering and tags into murals, stencils, wheat paste, and other media, producing the broader category now referred to as street art.
              </p>
              <p className="mt-3">
                Although there is overlap between graffiti writing and street art, they still have meaningful differences. Graffiti writing is primarily concerned with typography and tagging and primarily communicates within its own subculture, remaining illegible to outside audiences ("The Emergence of Modern Graffiti"). Street art functions differently, using a wider array of options such as stencils, wheat paste, murals, and illustration directed at a more general audience. This distinction matters for preservation because street art carries an implicit cultural relationship with the communities that encounter it, which is part of what makes its loss significant and gives it cultural importance worth recording.
              </p>
              <p className="mt-3">
                In December 1983, the Sidney Janis Gallery in New York mounted a Post-Graffiti exhibition featuring artists who had come up through the subway writing scene, marking a formal moment of mainstream art world recognition (Tomkins). Artists like Jean-Michel Basquiat and Keith Haring, both shaped by the graffiti subculture, crossed into gallery representation and international recognition during this period. Yet, the institutional acceptance of these particular figures did not resolve the existing tension between street culture and the art establishment. "I think of graffiti as graffiti. It's just meant to stay on the train" states writer SEEN (Tomkins). The impermanence which is intrinsic to the medium, represents a genuine counterargument to preservation efforts.
              </p>
              <p className="mt-3">
                This relationship to place distinguishes street art from many other art forms. When the physical setting is changed, through demolition, wear, renovation, or deliberate removal, the work is destroyed. This makes street art categorically different from most preserved art, which can survive the loss of its original context in a way street art cannot. Furthermore, street art functions outside the institutional framework that governs most of what is considered fine art. Without curatorial or admission requirements, the audience is defined entirely by proximity to the work, which subsequently shapes how it is valued, documented, and its longevity.
              </p>
              <p className="mt-3">
                The counterargument that impermanence is intrinsic to the form is legitimate but applies more effectively to works that complete their natural lifecycle rather than those removed by city policies or demolished without any record. A work that completes its natural lifecycle through weathering or material decay does not elicit the same preservation concerns as one which is deliberately removed, painted over, or lost to demolition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. How Detroit Became a Street Art City</h3>
              <p>
                Detroit's concentration of street art is the product of the historical, political, and economic conditions that have shaped the city's physical landscape and the communities living within it. The city's mid-twentieth century arc was shaped by two interconnected processes, that being redlining and white flight.
              </p>
              <p className="mt-3">
                Redlining is the federally authorized denial of mortgage lending and public investment to predominantly racially marginalized neighborhoods which systematically weakened the economic foundation for large swaths of the city (Carpenter). This would be compounded by white flight, the large-scale departure of white residents beginning in the 1950s and increasing through the 1960s and 70s. This, in turn, removed significant portions of the city's tax base and commercial infrastructure (Dilworth and Gardner). Consequently, Detroit's population would decrease from approximately 1.85 million at its peak in 1950 to slightly over 645,000 as of 2024 (United States Census Bureau). The physical consequence of this collapse was a sudden shift to large areas of vacant land and abandoned buildings. In turn, these surfaces became available in ways that more economically stable cities do not produce. However, their availability alone does not fully account for why communities used them the way they did. The 1967 Detroit uprising emerged from decades of institutional racism, discriminatory housing policy, and racialized policing, resulting in forty-three deaths and over seven thousand arrests ("Uprising of 1967"). The political conditions that produced it did not resolve after it ended. In the decades following, public space became an increasingly significant site of cultural production for communities excluded from formal cultural institutions, with Detroit's concentration of unsanctioned street art in part a product of that exclusion.
              </p>
              <p className="mt-3">
                The Heidelberg Project, initiated by artist Tyree Guyton in 1986, provides a documented example of the tension between community made public art and institutional response in Detroit. Guyton turned abandoned structures and lots on Heidelberg Street into grand, public installations without municipal authorization. Consequentially, Mayor Coleman Young ordered the demolition of three project houses in 1991 and Mayor Dennis Archer ordered three more to be demolished in 1999 ("Heidelberg Project"). This pattern of community works without institutional sanction being subjected to removal by municipal authority is not limited to high profile cases like Heidelberg. It demonstrates a common issue for street art across the city.
              </p>
              <p className="mt-3">
                Detroit's street art landscape is differentiated in a way that reflects its broader economic situation. Areas that have received concentrated investment and development, notably downtown and Midtown, heavily feature commissioned murals. Programs like Murals in the Market, the Be The Change art walk, and the Detroit Mural Project narrow focus on these areas demonstrate this issue. Beyond these programs, the city's unsanctioned graffiti remains largely undocumented and unprotected, concentrated in neighborhoods that have received minimal governmental attention. Paradoxically, the art which is at most risk of disappearing is the same as the art least likely to be documented.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Why Street Art Disappears</h3>
              <p>
                Street art disappears through two main causes, material degradation and deliberate removal, however these categories can intersect. In regards to its material qualities, the media and surfaces of the work are not designed for permanence. Spray paint is susceptible to ultraviolet degradation, moisture infiltration, and expansion and contraction due to temperature shifts. Likewise, wheat paste and paper deteriorate while stickers lose adhesion. These weathering processes occur in all exterior environments but can compound when the surfaces are already degraded. These works can not outlast the structure it occupies after structural failure or demolition.
              </p>
              <p className="mt-3">
                Intentional removal is done through several different methods, many rooted in how graffiti has long been framed as a symptom of societal disorder rather than as culture. Broken windows theory argued that visible indicators of disorder signify neglect and lead to further disorder and criminal activity. As discussed in "Broken Windows", graffiti confronts the viewer with the sense that their environment is "uncontrolled and uncontrollable, and that anyone can invade it to do whatever damage and mischief the mind suggests" (Kelling and Wilson). This theory would eventually become adopted by municipal governments and used to justify city wide, graffiti abatement programs. When the program launched in 2014, the city estimated between 75,000 and 100,000 illegal tags citywide, and by 2017 had removed 50,000 of them (Ferretti, "Detroit Touts Removal of 50K Graffiti Tags"). In 2015, Duggan doubled down on this, publicly stating to anyone who spray painted city buildings "we're going to arrest you and we're going to prosecute you" (Ferretti, "Mayor Mike Duggan Defended"). Classifying graffiti as a disorder responsible for larger societal issues rather than culture is a political decision with direct consequences for which communities lose their visual culture. In essence, the criminality of a work is not defined by its content or quality but instead its institutional approval.
              </p>
              <p className="mt-3">
                As neighborhood revitalization continues in Detroit, previously abandoned buildings which have stood for decades are rapidly being demolished and consequently so is their art. Between 2014 and 2019 alone, the city demolished over 20,000 blighted properties, with the heaviest concentration in the lowest-valued neighborhoods such as Brightmoor and Midwest (Skidmore et al.). Local artist Matthew Naimi observed that "the city took notice of graffiti and vandalism on dilapidated buildings, cracked down on it and then started removing the homes" (Barrett). From 2014 to 2025, approximately 27,000 abandoned houses have been demolished, with a few hundred planned to follow ("Mayor Duggan Provides Final Residential Blight Removal"). However, demolition is not a complete cultural loss in every case. Structurally unsound buildings present legitimate public safety concerns and their removal is not always a result of deliberate cultural erasure. Even so, this pattern seen across the city where unauthorized graffiti is treated as blight while commissioned murals are treated as points of interest, reflect a systematic preference for certain kinds of public art over others.
              </p>
              <p className="mt-3">
                This cycle is self-reinforcing. Work considered significant by institutional standards receives documentation, while work that does not meet those standards goes unrecorded. Over time, the absence of documentation gets interpreted as evidence of insignificance rather than selective attention. Archival theorists Schwartz and Cook argue that decisions about what gets recorded and preserved occur within frameworks that reflect existing power structures, naturalizing certain cultural omissions over time (Schwartz and Cook). These are value judgments that, without deliberate intervention, have equally permanent consequences for Detroit's visual record.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5. Existing Archives and Their Limits</h3>
              <p>
                Several digital archives for street art currently exist and provide useful points of comparison for evaluating both what is possible and what existing platforms fail to capture. Across all surveyed archives, their primary limitations are a constrained submission process, high quality control, or institutional curation with many platforms combining all three.
              </p>
              <p className="mt-3">
                Most openly accept submissions but moderate based on their respective criteria before publishing. Popular online archives including Bombing Science, Graffiti.org, Public Art Archive, and Stencil Archive all follow this model. Street Art Cities employs a more rigorous approach, only allowing verified, local contributors to submit art explicitly stating that its mission is quality over quantity and that "it's not about documenting everything, it's about documenting what matters" (Street Art Cities).
              </p>
              <p className="mt-3">
                More established platforms restrict contribution exclusively to verified institutions. Google Arts & Culture requires a formal institutional partnership. As such, existing Detroit collections are limited to organizations such as the Detroit Institute of Arts and Detroit Historical Society. Similarly, Archive-It is a subscription service for organizations, not individuals. Additionally, both platforms reserve street art as secondary to their traditional, institutional collections.
              </p>
              <p className="mt-3">
                Prioritizing a submission's quality over comprehensive documentation is a reasonable goal for platforms built around showcasing street art. However, this approach is insufficient for a wider range of art preservation. The artwork that is most at risk of disappearing is also the least likely to meet these platforms' criteria.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6. The Case for Community Sourced Digital Preservation</h3>
              <p>
                A community driven archival platform is not a perfect solution nor replacement for professional archival efforts. A photograph is not an adequate substitute for the work itself as digital documentation can not capture the full experience of a piece in its original, physical context. These are real limitations and acknowledging them helps to quantify the scope.
              </p>
              <p className="mt-3">
                Existing archives have demonstrated that professional and institutional documentation is limited in scope by definition. Therefore, community sourcing represents one practical model that scales to cover work that falls outside the bounds of traditional institutional documentation.
              </p>
              <p className="mt-3">
                iNaturalist provides a useful structural parallel for this. It is a community sourced database for identifying and documenting biodiversity and has resulted in scientific value. Due to its accessibility to the general public, observations from citizen scientists have continuously led to the discovery of new species (Lee). User contributions only require a camera, an account, and a phone or computer before submission. The result is coverage that scales with participation rather than institutional resources. The database contains inconsistencies in quality but achieves an abundance of coverage that no professional research team could have produced. As of 2024, the platform contained over 200 million observations from more than three million contributors worldwide, a scale no professional research team could replicate (Mason et al.). The same logic applies to street art documentation and reducing the barrier to entry produces a broader coverage.
              </p>
              <p className="mt-3">
                Alley Archive applies this model directly. The application requires only a photo, a title, and location to submit. There is no moderation queue, quality threshold, or institutional affiliation required. A photograph of a tag on a condemned building in a neighborhood no commissioned mural program has reached is equally as submittable as a large-scale sanctioned mural. The platform exists as a proof of concept for the argument this paper makes, that reducing the barrier to contribution is the primary mechanism by which omissions in the existing record get addressed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7. Ethical Considerations</h3>
              <p>
                As graffiti is a criminal offense in many cities, documenting street art raises ethical concerns. In Michigan, graffiti can result in felony charges carrying up to ten years in prison and fines up to $15,000 (Davis). For Detroit specifically, liability also extends to property owners who can be ticketed for graffiti on their buildings ("Detroit Public Art Anthology"). Creating an organized and geotagged record of unsanctioned work could theoretically be used as evidence in prosecution. Furthermore, artists who produce this work often do so anonymously and without expectation of permanent documentation. An archive introduces a record they did not choose to create.
              </p>
              <p className="mt-3">
                While this conflict of interests cannot be fully resolved, there are a few points worth considering. The work being documented is already public and visible to anyone who encounters the location. On platforms like Google Street View, this information already exists and is readily available to all users. The difference is that a dedicated archive creates a searchable, organized record where previously there was none.
              </p>
              <p className="mt-3">
                Alley Archive can not control all ensuing results of user submitted content. A platform is intended to record approximate locations rather than precise coordinates, limiting forensic utility without completely compromising on archival value. Beyond design choices, the project operates on the assumption that users will engage with preservation in the best interest of the artists and their work.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8. Conclusion</h3>
              <p>
                Street art is a culturally significant practice produced outside the institutional frameworks that typically determine what gets preserved. Its defining characteristics, site-specificity, public accessibility, and production outside institutional frameworks, are also the features that make it structurally vulnerable to erasure. The factors responsible for that erasure, ranging from material entropy to deliberate municipal policy, disproportionately affect work produced by the least institutionally represented communities.
              </p>
              <p className="mt-3">
                Documentation tools that previously required institutional resources are now widely accessible to ordinary people. A phone camera and a publicly accessible database can accomplish what previously required professional equipment, institutional backing, and significant funding. For Detroit specifically, where older infrastructure continues to be lost to demolition, the capacity for preservation exists with Alley Archive representing one attempt to resolve this.
              </p>
              <p className="mt-3">
                Digital preservation can not reverse what has already been lost and can not prevent existing policies in action. Nevertheless, it can help to preserve otherwise unwanted, unsanctioned artwork from disappearing without any record. This will produce an incomplete record, however incompleteness is preferable to the alternative of complete erasure.
              </p>
            </div>

            {/* Works Cited */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Works Cited</h3>
              <div className="flex flex-col gap-2 text-xs text-gray-500 leading-relaxed">
                <p>Barrett, Malachi. "Guardians of Graffiti: Inside an Effort to Protect Detroit's Vanishing Art." <em>BridgeDetroit</em>, 27 Sept. 2023.</p>
                <p>Carpenter, Craig. "Detroit." <em>Redlining in Michigan</em>, Michigan State University.</p>
                <p>Davis, Maurice. "Davis Law Group - Detroit Office." <em>Davis Law Group, PLLC</em>, 24 Aug. 2015.</p>
                <p>"Detroit Public Art Anthology." <em>Smartsheet.com</em>, 2026.</p>
                <p>Dilworth, Richardson, and Todd H Gardner. "White Flight." <em>The Wiley Blackwell Encyclopedia of Urban and Regional Studies</em>, 15 Apr. 2019.</p>
                <p>Duncan, Alexandra. "Street and Graffiti Art Movement Overview." <em>The Art Story</em>, 17 Apr. 2019.</p>
                <p>Ferretti, Christine. "Detroit Touts Removal of 50K Graffiti Tags." <em>The Detroit News</em>, 9 Nov. 2017.</p>
                <p>---. "Mayor Mike Duggan Defended the City's Prosecution of World-Renowned Artist." <em>Detroit News</em>, 16 July 2015.</p>
                <p>"Heidelberg Project." <em>Detroithistorical.org</em>, 19 Apr. 2018.</p>
                <p>Kelling, George L., and James Q. Wilson. "Broken Windows: The Police and Neighborhood Safety." <em>The Atlantic</em>, Mar. 1982.</p>
                <p>Lee, Leah. "How Can We Use Big Data from iNaturalist to Address Important Questions in Entomology?" <em>D-Lab</em>, 26 Feb. 2024.</p>
                <p>Mason, Brittany M, et al. "iNaturalist Accelerates Biodiversity Research." <em>BioScience</em>, vol. 75, no. 11, 28 July 2025.</p>
                <p>"Mayor Duggan Provides Final Residential Blight Removal Program Report." <em>City of Detroit</em>, 22 Dec. 2025.</p>
                <p>Schwartz, Joan M., and Terry Cook. "Archives, Records, and Power: The Making of Modern Memory." <em>Archival Science</em>, vol. 2, no. 1–2, Mar. 2002, pp. 1–19.</p>
                <p>Skidmore, Mark, et al. <em>Knocking down Abandoned Buildings Has a Lot of Benefits for Detroit — but It's Costly</em>. 7 Mar. 2025.</p>
                <p>Street Art Cities. "Why Street Art Cities Only Works with Local Hunters (and Not as an Open Platform)!" <em>Substack.com</em>, 19 Nov. 2025.</p>
                <p>"The Emergence of Modern Graffiti." <em>Columbia</em>.</p>
                <p>"The Evolution of Street Art: How Graffiti Shaped Urban Culture." <em>Sotheby's Institute of Art</em>, 2025.</p>
                <p>Tomkins, Calvin. "The Rise of Graffiti Art." <em>The New Yorker</em>, 19 Mar. 1984.</p>
                <p>United States Census Bureau. "QuickFacts: Detroit City, Michigan." 2024.</p>
                <p>"Uprising of 1967." <em>Detroithistorical.org</em>, 15 July 2021.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}
export default AboutPage