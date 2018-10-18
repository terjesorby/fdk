package no.acat.harvester;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import no.acat.config.Utils;
import no.acat.model.ApiCatalogRecord;
import no.acat.model.ApiDocument;
import no.acat.service.ApiDocumentBuilderService;
import no.acat.service.ElasticsearchService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Client;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/*
The purpose of the harvester is to ensure that search index is synchronized to registrations.
 */
@Service
public class ApiHarvester {
    private static final Logger logger = LoggerFactory.getLogger(ApiHarvester.class);

    private Client elasticsearchClient;
    private ApiDocumentBuilderService apiDocumentBuilderService;
    private ObjectMapper mapper = Utils.jsonMapper();

    @Autowired
    public ApiHarvester(ElasticsearchService elasticsearchService, ApiDocumentBuilderService apiDocumentBuilderService) {
        this.elasticsearchClient = elasticsearchService.getClient();
        this.apiDocumentBuilderService = apiDocumentBuilderService;
    }

    public List<ApiDocument> harvestAll() {
        List<ApiDocument> result = new ArrayList<>();

        List<ApiCatalogRecord> apiCatalog = getApiCatalog();

        for (ApiCatalogRecord apiCatalogRecord : apiCatalog) {
            try {
                ApiDocument apiDocument = apiDocumentBuilderService.create(apiCatalogRecord);
                indexApi(apiDocument);
                result.add(apiDocument);
            } catch (Exception e) {
                logger.error("Error importing API record: {}", e.getMessage());
            }
        }
        return result;
    }

    void indexApi(ApiDocument document) throws JsonProcessingException {
        BulkRequestBuilder bulkRequest = elasticsearchClient.prepareBulk();
        String id = document.getId();
        IndexRequest request = new IndexRequest("acat", "apidocument", id);

        String json = mapper.writeValueAsString(document);
        request.source(json);
        bulkRequest.add(request);

        BulkResponse bulkResponse = bulkRequest.execute().actionGet();
        if (bulkResponse.hasFailures()) {
            final String msg = String.format("Failed index of %s. Reason %s", id, bulkResponse.buildFailureMessage());
            throw new RuntimeException(msg);
        }

        logger.info("ApiDocument is indexed. id={}, url={}", document.getId(), document.getApiSpecUrl());
    }

    List<ApiCatalogRecord> getApiCatalog() {
        List<ApiCatalogRecord> result = new ArrayList<>();

        org.springframework.core.io.Resource apiCatalogCsvFile = new ClassPathResource("apis.csv");
        Iterable<CSVRecord> records;

        try (
            Reader input =
                new BufferedReader(new InputStreamReader(apiCatalogCsvFile.getInputStream()))
        ) {
            records = CSVFormat.EXCEL.withHeader().withDelimiter(';').parse(input);

            for (CSVRecord line : records) {
                ApiCatalogRecord catalogRecord = new ApiCatalogRecord().builder()
                    .orgNr(line.get("OrgNr"))
                    .apiSpecUrl(line.get("ApiSpecUrl"))
                    .apiDocUrl(line.get("ApiDocUrl"))
                    .nationalComponent("true".equals(line.get("NationalComponent")))
                    .datasetReferences(Arrays.asList(line.get("DatasetRefs").split(",")))
                    .build();

                result.add(catalogRecord);
            }

            logger.info("Read {} api catalog records.", result.size());

        } catch (
            IOException e) {
            logger.error("Could not read api catalog records: {}", e.getMessage());
        }
        return result;
    }


}
