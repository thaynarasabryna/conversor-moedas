import { flags } from "./flags.js";

// VALIDAÇÃO DE ALERTAS
(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})()

// PROCESSAMENTO BACKEND

const API = "https://economia.awesomeapi.com.br";

// Listagem das moedas no select
function ExchangeOption(codigo, descricao) {
    const option = document.createElement("option");
    option.value = codigo;
    option.textContent = `${descricao} (${codigo})`;

    return option;
}

async function getExchangeCodes() {
    const response = await fetch(
        `${API}/json/available/uniq`
    );
    return response.json();
}

async function handleListarMoedasSelect() {
    const moedas = await getExchangeCodes();
    const moedasCodes = Object.keys(moedas);

    const origemMoedaSelect = document.getElementById("origem-moeda");
    const destinoMoedaSelect = document.getElementById("destino-moeda");

    for (let codigo of moedasCodes) {
        origemMoedaSelect.appendChild(ExchangeOption(codigo, moedas[codigo]));
        destinoMoedaSelect.appendChild(ExchangeOption(codigo, moedas[codigo]));
    }
}

window.addEventListener("load", handleListarMoedasSelect);

// Mostrar a bandeira do país
function getFlagByCode(codigo) {
    for (let flag of flags) {
        if (flag.codigo == codigo) {
            return flag.flag;
        }
    }
}

function handleChangeMoedas(event) {
    const select = event.target;
    const selectContainer = document.getElementById(`${select.id}-flag`);
    selectContainer.innerHTML = `<img src="${getFlagByCode(select.value)}">`;
}

const origemMoedaSelect = document.getElementById("origem-moeda");
const destinoMoedaSelect = document.getElementById("destino-moeda");

origemMoedaSelect.addEventListener("change", handleChangeMoedas);
destinoMoedaSelect.addEventListener("change", handleChangeMoedas);

// Trocando o dinheiro
async function getExchangeByMoedas(origemMoeda, destinoMoeda) {
    const response = await fetch(
        `${API}/last/${origemMoeda}-${destinoMoeda}`
    );
    const data = await response.json();
    return Number(data[origemMoeda + destinoMoeda].bid);
}

async function handleSubmitExchangeMoney(event) {
    event.preventDefault();
    const form = event.target;

    const money = form["money"].value;
    const origemMoedaCodigo = form["origem-moeda"].value;
    const destinoMoedaCodigo = form["destino-moeda"].value;

    const moedasExchange = await getExchangeByMoedas(
        origemMoedaCodigo,
        destinoMoedaCodigo
    );

    const exchangeMoney = money * moedasExchange;

    const result = document.getElementById("result");
    result.textContent = exchangeMoney.toLocaleString("pt-BR", {
        style: "currency",
        currency: destinoMoedaCodigo,
    });
}

const exchangeForm = document.getElementById("exchange-form");
exchangeForm.addEventListener("submit", handleSubmitExchangeMoney);