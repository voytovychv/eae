package com.eae.schedule.ui.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.eae.schedule.model.PublicationLanguage;
import com.eae.schedule.repo.PublicationLangsRepository;
import com.eae.schedule.ui.model.Response;

@RestController
@RequestMapping("/publicationLangs")
public class PublicationLanguagesController {

	@Autowired
	private PublicationLangsRepository langs;
	
	
	
	@RequestMapping(name="/", method=RequestMethod.GET)
	public Response<PublicationLanguage> getAll() {
		Response<PublicationLanguage> response = new Response<PublicationLanguage>();
		List<PublicationLanguage> languages = langs.findAll(Sort.by("isoCode"));
		response.setSuccessful(true);
		response.setObjects(languages);
		return response;
	}

	@RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<PublicationLanguage> getCreate(@RequestBody PublicationLanguage lang) {
		Response<PublicationLanguage> response = new Response<PublicationLanguage>();
		langs.saveAndFlush(lang);
		response.addObject(lang);
		response.setSuccessful(true);
		return response;
	}
	
	@RequestMapping(value="/delete/{langId}", method=RequestMethod.DELETE)
    public Response<Object> deletePeriod(@PathVariable(value="langId") String langId) {
    	Response<Object> response = new Response<Object>();
    	this.langs.deleteById(langId);
    	response.setSuccessful(true);
    	return response;
    }
	
	
}
