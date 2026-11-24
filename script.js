const haku = document.querySelector("#haku");
const hakutulos = document.querySelector("#hakutulos");
const listanSisalto = document.querySelector("main dl");

if (haku && hakutulos && listanSisalto) {
  const kohdat = [...listanSisalto.querySelectorAll("dt, dd")];

  function suodataLista() {
    const hakusana = haku.value.trim().toLocaleLowerCase("fi");
    let osumia = 0;

    for (let i = 0; i < kohdat.length; i++) {
      const kohta = kohdat[i];
      const loytyy = kohta.textContent.toLocaleLowerCase("fi").includes(hakusana);

      kohta.hidden = !loytyy;

      if (loytyy) {
        osumia++;
      }
    }

    hakutulos.textContent = hakusana
      ? `Näytetään ${osumia} hakutulosta.`
      : `Näytetään kaikki ${kohdat.length} kohtaa.`;
  }

  haku.addEventListener("input", suodataLista);
  suodataLista();
}


const lomake = document.querySelector("#ilmoittautuminen");

if (lomake) {
  const kentat = [...lomake.querySelectorAll("input[required], select[required]")];
  const onnistuminen = document.querySelector("#onnistuminen");

  kentat.forEach((kentta) => {
    const virheId = `${kentta.id}-virhe`;
    let virheTeksti = document.getElementById(virheId);

    if (!virheTeksti) {
      virheTeksti = document.createElement("span");
      virheTeksti.id = virheId;
      virheTeksti.className = "kenttavirhe";
      virheTeksti.hidden = true;
      kentta.insertAdjacentElement("afterend", virheTeksti);
    }

    kentta.setAttribute("aria-describedby", virheId);
  });

  function naytaVirhe(kentta) {
    const virheTeksti = document.getElementById(`${kentta.id}-virhe`);

    if (kentta.validity.valueMissing) {
      virheTeksti.textContent = "Tämä kenttä on pakollinen.";
    } else if (kentta.validity.typeMismatch) {
      virheTeksti.textContent = "Tarkista, että tieto on oikeassa muodossa.";
    } else {
      virheTeksti.textContent = kentta.validationMessage;
    }

    virheTeksti.hidden = false;
    kentta.setAttribute("aria-invalid", "true");
  }

  function poistaVirhe(kentta) {
    const virheTeksti = document.getElementById(`${kentta.id}-virhe`);

    virheTeksti.textContent = "";
    virheTeksti.hidden = true;
    kentta.removeAttribute("aria-invalid");
  }

  try {
    const tallennetutTiedot = JSON.parse(
      localStorage.getItem("lapuanLepakotIlmoittautuminen") || "{}"
    );

    kentat.forEach((kentta) => {
      if (tallennetutTiedot[kentta.name]) {
        kentta.value = tallennetutTiedot[kentta.name];
      }
    });
  } catch {

}

  kentat.forEach((kentta) => {
    kentta.addEventListener("input", () => {
      if (kentta.validity.valid) {
        poistaVirhe(kentta);
      }

      const tiedot = Object.fromEntries(
        kentat.map((elementti) => [elementti.name, elementti.value])
      );

      try {
        localStorage.setItem(
          "lapuanLepakotIlmoittautuminen",
          JSON.stringify(tiedot)
        );
      } catch {

      }
    });

    kentta.addEventListener("change", () => {
      if (kentta.validity.valid) {
        poistaVirhe(kentta);
      }
    });
  });

  lomake.addEventListener("submit", (tapahtuma) => {
    tapahtuma.preventDefault();

    if (onnistuminen) {
      onnistuminen.textContent = "";
    }

    const virheellinenKentta = kentat.find((kentta) => !kentta.validity.valid);

    if (virheellinenKentta) {
      kentat.forEach((kentta) => {
        if (!kentta.validity.valid) {
          naytaVirhe(kentta);
        } else {
          poistaVirhe(kentta);
        }
      });

      virheellinenKentta.focus();
      return;
    }

    kentat.forEach(poistaVirhe);

    if (onnistuminen) {
      onnistuminen.textContent = "Pyyntö on valmis.";
    }

    lomake.reset();

    try {
      localStorage.removeItem("lapuanLepakotIlmoittautuminen");
    } catch {
      // Ei tehdä mitään, jos localStorage ei ole käytettävissä.
    }
  });
}



const popoverPainike = document.querySelector("#popover-painike");
const popoverSisalto = document.querySelector("#popover-sisalto");

if (popoverPainike && popoverSisalto) {
  popoverPainike.setAttribute("aria-expanded", "false");
  popoverPainike.setAttribute("aria-controls", "popover-sisalto");
  popoverSisalto.hidden = true;

  function suljePopover(palautaFokus = false) {
    popoverSisalto.hidden = true;
    popoverPainike.setAttribute("aria-expanded", "false");

    if (palautaFokus) {
      popoverPainike.focus();
    }
  }

  popoverPainike.addEventListener("click", () => {
    const avataan = popoverSisalto.hidden;
    popoverSisalto.hidden = !avataan;
    popoverPainike.setAttribute("aria-expanded", String(avataan));

    if (avataan) {
      popoverSisalto.querySelector("a, button, input")?.focus();
    }
  });

  popoverSisalto.addEventListener("keydown", (tapahtuma) => {
    if (tapahtuma.key === "Escape") {
      suljePopover(true);
    }
  });

  document.addEventListener("click", (tapahtuma) => {
    if (
      !popoverSisalto.hidden &&
      !popoverSisalto.contains(tapahtuma.target) &&
      !popoverPainike.contains(tapahtuma.target)
    ) {
      suljePopover();
    }
  });
}